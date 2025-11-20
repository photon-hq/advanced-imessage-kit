import { EventEmitter } from "node:events";
import io from "socket.io-client";
import { getLogger, setGlobalLogLevel } from "./lib/Loggable";
import type { LogLevel } from "./lib/Logger";
import {
    AttachmentModule,
    ChatModule,
    ContactModule,
    FaceTimeModule,
    HandleModule,
    ICloudModule,
    MessageModule,
    ScheduledMessageModule,
    ServerModule,
} from "./modules";
import type { ClientConfig, SocketEventMap } from "./types";

export class AdvancedIMessageKit extends EventEmitter {
    private static getGlobalSdk = (): AdvancedIMessageKit | null => (globalThis as any).__AdvancedIMessageKit__ ?? null;
    private static setGlobalSdk = (sdk: AdvancedIMessageKit) => {
        (globalThis as any).__AdvancedIMessageKit__ = sdk;
    };

    public static getInstance(config?: ClientConfig): AdvancedIMessageKit {
        const existing = AdvancedIMessageKit.getGlobalSdk();
        if (existing) return existing;

        const instance = new AdvancedIMessageKit(config);
        AdvancedIMessageKit.setGlobalSdk(instance);
        return instance;
    }

    // Core
    public readonly config: ClientConfig;
    public readonly logger = getLogger("AdvancedIMessageKit");
    public readonly socket: ReturnType<typeof io>;

    public readonly attachments: AttachmentModule;
    public readonly messages: MessageModule;
    public readonly chats: ChatModule;

    public readonly contacts: ContactModule;
    public readonly handles: HandleModule;

    public readonly facetime: FaceTimeModule;
    public readonly icloud: ICloudModule;

    public readonly scheduledMessages: ScheduledMessageModule;
    public readonly server: ServerModule;

    // Message deduplication feature
    private processedMessages = new Set<string>();

    private constructor(config: ClientConfig = {}) {
        super();

        this.config = {
            serverUrl: "http://localhost:1234",
            logLevel: "info",
            ...config,
        };

        if (this.config.logLevel) {
            setGlobalLogLevel(this.config.logLevel as LogLevel);
        }

        const auth: Record<string, string> = {};
        if (this.config.apiKey) auth.apiKey = this.config.apiKey;

        this.socket = io(this.config.serverUrl, {
            transports: ["websocket"], // Only WebSocket - polling disabled to prevent message duplication
            timeout: 10000, // 10 second timeout to avoid overly frequent reconnections
            forceNew: true, // Force new connection to avoid connection state pollution
            auth: Object.keys(auth).length ? auth : undefined,
        });

        this.attachments = new AttachmentModule(this);
        this.messages = new MessageModule(this);
        this.chats = new ChatModule(this);

        this.contacts = new ContactModule(this);
        this.handles = new HandleModule(this);

        this.facetime = new FaceTimeModule(this);
        this.icloud = new ICloudModule(this);

        this.scheduledMessages = new ScheduledMessageModule(this);
        this.server = new ServerModule(this);
    }

    /**
     * Generic request method to send data to the server and wait for a response.
     * Replaces HTTP requests with Socket.IO acknowledgements.
     *
     * For known events, the SocketEventMap type provides strong typing.
     * For any custom/unknown events, a generic fallback overload is available.
     */
    async request<K extends keyof SocketEventMap>(
        event: K,
        data?: SocketEventMap[K]["req"],
    ): Promise<SocketEventMap[K]["res"]>;

    async request<T = any>(event: string, data?: any): Promise<T>;

    async request(event: string, data?: any): Promise<any> {
        const timeoutMs = 120000; // 2 minute safety timeout to avoid hanging indefinitely

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Request to event "${event}" timed out after ${timeoutMs}ms`));
            }, timeoutMs);

            if (!this.socket.connected) {
                // Optional: Attempt to connect or wait? For now, fail fast if not connected is safer for strict consistency.
                // Or we could wait for 'connect' event.
                // reject(new Error("Socket not connected"));
                // Let's allow it to queue internally by socket.io if possible, but socket.io usually buffers.
            }

            this.socket.emit(event, data, (response: any) => {
                clearTimeout(timeoutId);

                // Standardize response handling based on the server's ResponseJson structure
                if (response?.status === 200) {
                    resolve(response.data);
                } else {
                    const errorMsg = response?.error?.message || response?.message || "Unknown server error";
                    reject(new Error(errorMsg));
                }
            });
        });
    }

    async connect() {
        const serverEvents = [
            "new-message",
            "message-updated",
            "updated-message",
            "chat-read-status-changed",
            "group-name-change",
            "participant-added",
            "participant-removed",
            "participant-left",
            "group-icon-changed",
            "group-icon-removed",
            "message-send-error",
            "typing-indicator",
            "new-server",
        ];

        for (const eventName of serverEvents) {
            this.socket.on(eventName, (...args: any[]) => {
                if (eventName === "new-message" && args.length > 0) {
                    const message = args[0];
                    if (message?.guid) {
                        // Check if this message has already been processed
                        if (this.processedMessages.has(message.guid)) {
                            this.logger.debug(`Message already processed, skipping duplicate: ${message.guid}`);
                            return;
                        }
                        // Mark message as processed
                        this.processedMessages.add(message.guid);
                    }
                }

                this.emit(eventName, ...args);
            });
        }

        this.socket.on("disconnect", () => {
            this.logger.info("Disconnected from iMessage server");
            this.emit("disconnect");
        });

        if (this.socket.connected) {
            this.logger.info("Already connected to iMessage server");
            this.emit("ready");
            return;
        }

        this.socket.once("connect", () => {
            this.logger.info("Connected to iMessage server");
            this.emit("ready");
        });

        if (!this.socket.connected) {
            this.socket.connect();
        }
    }

    async disconnect() {
        this.socket.disconnect();
    }

    /**
     * Clear processed message records (prevent memory leaks)
     * @param maxSize Maximum number of messages to retain, default 1000
     */
    public clearProcessedMessages(maxSize: number = 1000) {
        if (this.processedMessages.size > maxSize) {
            const messages = Array.from(this.processedMessages);
            this.processedMessages.clear();
            // Keep the most recent portion of messages
            messages.slice(-Math.floor(maxSize / 2)).forEach((guid) => {
                this.processedMessages.add(guid);
            });
            this.logger.debug(`Cleared processed message records, retained ${this.processedMessages.size} messages`);
        }
    }

    /**
     * Get the count of processed messages
     */
    public getProcessedMessageCount(): number {
        return this.processedMessages.size;
    }
}

export const SDK = AdvancedIMessageKit.getInstance;
