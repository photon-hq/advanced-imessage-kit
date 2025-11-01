import { EventEmitter } from "node:events";
import { getLogger } from "./Loggable";

/**
 * WebSocket adapter for imsgd protocol
 * Translates socket.io-style events to native WebSocket messages
 * 
 * Note: Uses global WebSocket which is available in:
 * - Bun (built-in)
 * - Browser (native)
 * - Node.js 18+ (experimental global)
 */
export class WebSocketAdapter extends EventEmitter {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private reconnectDelay = 1000;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly logger = getLogger("WebSocketAdapter");
    private readonly url: string;
    private isConnecting = false;
    private isConnected = false;
    private isEngineIO = false; // Track if we're using Engine.IO protocol

    constructor(url: string) {
        super();
        this.url = url;
    }

    connect(): void {
        if (this.isConnecting || this.isConnected) {
            return;
        }

        this.isConnecting = true;
        this.connectWebSocket();
    }

    private connectWebSocket(): void {
        try {
            this.logger.info(`Connecting to WebSocket: ${this.url}`);
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                this.logger.info("WebSocket connected");
                this.isConnecting = false;
                // Don't emit connect yet - we'll detect Engine.IO protocol from first message
                // If first message is Engine.IO OPEN packet, emit connect then
                // Otherwise, emit connect immediately for non-Engine.IO connections
            };

            this.ws.onmessage = (event) => {
                try {
                    const rawData = event.data as string;
                    
                    // Debug: log all received messages (truncated for large messages)
                    const preview = rawData.length > 200 ? rawData.substring(0, 200) + "..." : rawData;
                    this.logger.debug(`Received WebSocket message (${rawData.length} bytes): ${preview}`);
                    
                    // Detect Engine.IO protocol from first message
                    if (!this.isEngineIO && rawData.startsWith("0")) {
                        this.isEngineIO = true;
                        this.logger.debug("Detected Engine.IO protocol");
                    }
                    
                    // Handle Engine.IO protocol format (Socket.io)
                    // Packet types: 0=OPEN, 1=CLOSE, 2=PING, 3=PONG, 40=MESSAGE, 42=EVENT
                    
                    // Handle Engine.IO OPEN packet: 0{"sid":"...","upgrades":[],"pingInterval":25000,"pingTimeout":20000}
                    if (rawData.startsWith("0")) {
                        if (rawData === "0") {
                            // Empty OPEN packet (shouldn't happen, but handle gracefully)
                            this.logger.debug("Received empty Engine.IO OPEN packet");
                            return;
                        }
                        // OPEN packet with configuration - connection is now truly established
                        try {
                            const config = JSON.parse(rawData.substring(1));
                            this.logger.debug(`Engine.IO OPEN packet received: ${JSON.stringify(config)}`);
                            // Mark as connected and emit connect event
                            if (!this.isConnected) {
                                this.isConnected = true;
                                this.isEngineIO = true;
                                this.reconnectAttempts = 0;
                                this.emit("connect");
                            }
                            return;
                        } catch (parseError) {
                            this.logger.warn(`Failed to parse Engine.IO OPEN packet: ${parseError}`);
                        }
                    }
                    
                    // Handle Engine.IO MESSAGE (40) or EVENT (42) packets
                    // Format: 40["event_name",data] or 42["event_name",data]
                    if (rawData.startsWith("40") || rawData.startsWith("42")) {
                        const packetType = rawData.substring(0, 2);
                        const payload = rawData.substring(2);
                        
                        this.logger.debug(`Processing Engine.IO ${packetType === "40" ? "MESSAGE" : "EVENT"} packet`);
                        
                        try {
                            const eventArray = JSON.parse(payload);
                            if (Array.isArray(eventArray) && eventArray.length >= 1) {
                                const eventName = eventArray[0];
                                const eventData = eventArray.length > 1 ? eventArray[1] : null;
                                this.logger.debug(`Emitting Engine.IO event: ${eventName} (data: ${JSON.stringify(eventData).substring(0, 100)})`);
                                this.emit(eventName, eventData);
                                return;
                            }
                        } catch (parseError) {
                            this.logger.warn(`Failed to parse Engine.IO payload: ${parseError}, payload: ${payload.substring(0, 100)}`);
                        }
                    }
                    
                    // Handle Engine.IO control packets (single character)
                    if (rawData === "1" || rawData === "2" || rawData === "3") {
                        this.logger.debug(`Received Engine.IO control packet: ${rawData}`);
                        return;
                    }
                    
                    // If we reach here and haven't emitted connect yet, emit it now (non-Engine.IO connection)
                    if (!this.isConnected) {
                        this.isConnected = true;
                        this.reconnectAttempts = 0;
                        this.emit("connect");
                    }
                    
                    // Try to parse as JSON (fallback for other formats)
                    try {
                        const data = JSON.parse(rawData);
                        
                        // Handle different message types
                        if (data.type && data.data) {
                            // imsgd protocol format: { type: "event_name", data: {...} }
                            const eventName = data.type;
                            const eventData = data.data;
                            this.logger.debug(`Emitting JSON event: ${eventName} (data: ${JSON.stringify(eventData).substring(0, 100)})`);
                            this.emit(eventName, eventData);
                        } else {
                            // Direct event format: { event: "event_name", data: {...} }
                            const eventName = data.event || "message";
                            const eventData = data.data || data;
                            this.logger.debug(`Emitting JSON event (fallback): ${eventName} (data: ${JSON.stringify(eventData).substring(0, 100)})`);
                            this.emit(eventName, eventData);
                        }
                    } catch (jsonError) {
                        // Not JSON, emit raw message
                        this.logger.warn(`Failed to parse WebSocket message: ${jsonError}, rawData: ${rawData.substring(0, 100)}`);
                        this.emit("message", rawData);
                    }
                } catch (error) {
                    this.logger.warn(`Failed to process WebSocket message: ${error}, event.data: ${String(event.data).substring(0, 100)}`);
                    this.emit("message", event.data);
                }
            };

            this.ws.onerror = (error) => {
                // Extract error message from ErrorEvent
                const errorMessage = error instanceof ErrorEvent 
                    ? error.message || error.type || "Unknown WebSocket error"
                    : error instanceof Error 
                    ? error.message 
                    : String(error);
                
                this.logger.error(`WebSocket error: ${errorMessage}`);
                
                // Don't emit ErrorEvent directly, emit a plain error
                const plainError = error instanceof ErrorEvent 
                    ? new Error(errorMessage)
                    : error instanceof Error
                    ? error
                    : new Error(String(error));
                
                this.emit("error", plainError);
            };

            this.ws.onclose = (event) => {
                this.logger.info(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
                this.isConnecting = false;
                this.isConnected = false;
                this.emit("disconnect", event.reason);

                // Attempt to reconnect if not a normal closure
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                }
            };
        } catch (error) {
            this.logger.error(`Failed to create WebSocket: ${error}`);
            this.isConnecting = false;
            this.emit("error", error);
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) {
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            30000
        );

        this.logger.info(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connectWebSocket();
        }, delay);
    }

    override emit(event: string, ...args: any[]): boolean {
        // Emit to listeners
        return super.emit(event, ...args);
    }

    override on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    override once(event: string, listener: (...args: any[]) => void): this {
        return super.once(event, listener);
    }

    override off(event: string, listener: (...args: any[]) => void): this {
        return super.off(event, listener);
    }

    /**
     * Send a message through WebSocket
     * Supports both Engine.IO format (for Socket.io) and JSON format (for imsgd protocol)
     */
    send(event: string, data?: any): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.logger.warn(`Cannot send message: WebSocket not connected (event: ${event})`);
            return;
        }

        try {
            // Check if we're connected to Socket.io (Engine.IO format)
            // If URL contains /socket.io/ or we've detected Engine.IO protocol, use Engine.IO format
            if (this.isEngineIO || this.url.includes("/socket.io/")) {
                // Engine.IO EVENT packet format: 42["event_name",data]
                const payload = JSON.stringify([event, data]);
                this.ws.send(`42${payload}`);
            } else {
                // JSON format for imsgd protocol
                const message = {
                    type: event,
                    data: data,
                };
                this.ws.send(JSON.stringify(message));
            }
        } catch (error) {
            this.logger.error(`Failed to send message: ${error}`);
            this.emit("error", error);
        }
    }

    /**
     * Check if WebSocket is connected
     */
    get connected(): boolean {
        return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
    }

    /**
     * Disconnect WebSocket
     */
    disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ws) {
            this.ws.close(1000, "Client disconnect");
            this.ws = null;
        }

        this.isConnecting = false;
        this.isConnected = false;
        this.isEngineIO = false;
    }
}

