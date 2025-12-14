import { EventEmitter } from "node:events";
import axios, { type AxiosInstance } from "axios";
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
    PollModule,
    ScheduledMessageModule,
    ServerModule,
} from "./modules";
import type { ClientConfig, PhotonEventMap, TypedEventEmitter } from "./types";

export class AdvancedIMessageKit extends EventEmitter implements TypedEventEmitter {
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
    public readonly http: AxiosInstance;
    public readonly socket: ReturnType<typeof io>;

    public readonly attachments: AttachmentModule;
    public readonly messages: MessageModule;
    public readonly chats: ChatModule;

    public readonly contacts: ContactModule;
    public readonly handles: HandleModule;

    public readonly facetime: FaceTimeModule;
    public readonly icloud: ICloudModule;

    public readonly polls: PollModule;
    public readonly scheduledMessages: ScheduledMessageModule;
    public readonly server: ServerModule;

    // Message deduplication feature
    //
    // Purpose: Prevent message reply loops caused by server repeatedly pushing
    // the same message content with different GUIDs due to unstable Socket.IO connections.
    // This is especially problematic when the polling transport causes connection issues.
    private processedMessages = new Set<string>();

    // Send queue for sequential message delivery
    //
    // Purpose: Ensure all outgoing messages (text, attachments, stickers, etc.) from
    // a single user/SDK instance are sent in strict order, preventing race conditions.
    private sendQueue: Promise<unknown> = Promise.resolve();

    // Flag to track if 'ready' event has been emitted
    //
    // Purpose: Prevent duplicate 'ready' events when both legacy mode (no API key)
    // and auth-ok events occur, which would cause user callbacks to fire twice.
    private readyEmitted = false;

    constructor(config: ClientConfig = {}) {
        super();

        this.config = {
            serverUrl: "http://localhost:1234",
            logLevel: "info",
            ...config,
        };

        if (this.config.logLevel) {
            setGlobalLogLevel(this.config.logLevel as LogLevel);
        }

        this.http = axios.create({
            baseURL: this.config.serverUrl,
            headers: this.config.apiKey ? { "X-API-Key": this.config.apiKey } : undefined,
        });

        this.socket = io(this.config.serverUrl, {
            auth: this.config.apiKey ? { apiKey: this.config.apiKey } : undefined,
            // 🚨 IMPORTANT: Polling transport configuration notes
            //
            // Root cause analysis:
            // 1. Socket.IO 'polling' transport can cause unstable connections in certain network environments
            // 2. When "xhr poll error" occurs, Socket.IO attempts to reconnect
            // 3. During reconnection, the server may repeatedly push the same message with different GUIDs
            // 4. This is not simple client-side duplicate processing, but server-side message duplication
            //
            // Solutions:
            // - Prioritize WebSocket transport, fallback to polling as backup
            // - Set reasonable timeout to avoid frequent reconnections
            // - Use forceNew to ensure fresh connections and avoid state pollution
            // - Implement client-side message deduplication as the last line of defense
            transports: ["websocket"], // Only WebSocket - polling disabled to prevent message duplication
            timeout: 10000, // 10 second timeout to avoid overly frequent reconnections
            forceNew: true, // Force new connection to avoid connection state pollution
        });

        // Bind enqueueSend to this instance for use in modules
        const enqueueSend = this.enqueueSend.bind(this);

        this.attachments = new AttachmentModule(this.http, enqueueSend);
        this.messages = new MessageModule(this.http, enqueueSend);
        this.chats = new ChatModule(this.http);

        this.contacts = new ContactModule(this.http);
        this.handles = new HandleModule(this.http);

        this.facetime = new FaceTimeModule(this.http);
        this.icloud = new ICloudModule(this.http);

        this.polls = new PollModule(this.http);
        this.scheduledMessages = new ScheduledMessageModule(this.http);
        this.server = new ServerModule(this.http);
    }

    override emit<K extends keyof PhotonEventMap>(
        event: K,
        ...args: PhotonEventMap[K] extends undefined ? [] : [PhotonEventMap[K]]
    ): boolean;
    override emit(event: string | symbol, ...args: unknown[]): boolean {
        return super.emit(event, ...(args as [unknown, ...unknown[]]));
    }

    override on<K extends keyof PhotonEventMap>(
        event: K,
        listener: PhotonEventMap[K] extends undefined ? () => void : (data: PhotonEventMap[K]) => void,
    ): this;
    override on(event: string | symbol, listener: (...args: unknown[]) => void): this {
        return super.on(event, listener as (...args: unknown[]) => void);
    }

    override once<K extends keyof PhotonEventMap>(
        event: K,
        listener: PhotonEventMap[K] extends undefined ? () => void : (data: PhotonEventMap[K]) => void,
    ): this;
    override once(event: string | symbol, listener: (...args: unknown[]) => void): this {
        return super.once(event, listener as (...args: unknown[]) => void);
    }

    override off<K extends keyof PhotonEventMap>(
        event: K,
        listener: PhotonEventMap[K] extends undefined ? () => void : (data: PhotonEventMap[K]) => void,
    ): this;
    override off(event: string | symbol, listener: (...args: unknown[]) => void): this {
        return super.off(event, listener as (...args: unknown[]) => void);
    }

    override addListener<K extends keyof PhotonEventMap>(
        event: K,
        listener: PhotonEventMap[K] extends undefined ? () => void : (data: PhotonEventMap[K]) => void,
    ): this;
    override addListener(event: string | symbol, listener: (...args: unknown[]) => void): this {
        return super.addListener(event, listener as (...args: unknown[]) => void);
    }

    override removeListener<K extends keyof PhotonEventMap>(
        event: K,
        listener: PhotonEventMap[K] extends undefined ? () => void : (data: PhotonEventMap[K]) => void,
    ): this;
    override removeListener(event: string | symbol, listener: (...args: unknown[]) => void): this {
        return super.removeListener(event, listener as (...args: unknown[]) => void);
    }

    async connect() {
        const serverEvents: (keyof PhotonEventMap)[] = [
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
            "incoming-facetime",
            "ft-call-status-changed",
            "hello-world",
        ];

        for (const eventName of serverEvents) {
            this.socket.on(eventName, (...args: unknown[]) => {
                // Message deduplication logic
                //
                // Problem: When Socket.IO connection is unstable (especially with polling transport),
                // the server may repeatedly push the same message content with different GUIDs.
                // This bypasses traditional GUID-based deduplication and causes message reply loops.
                //
                // Solution: Use GUID as unique identifier for deduplication
                if (eventName === "new-message" && args.length > 0) {
                    const message = args[0] as { guid?: string };
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

                if (args.length > 0) {
                    super.emit(eventName, args[0]);
                } else {
                    super.emit(eventName);
                }
            });
        }

        this.socket.on("disconnect", () => {
            this.logger.info("Disconnected from iMessage server");
            this.readyEmitted = false;
            this.emit("disconnect");
        });

        // Listen for authentication success
        this.socket.on("auth-ok", () => {
            this.logger.info("Authentication successful");
            if (!this.readyEmitted) {
                this.readyEmitted = true;
                this.emit("ready");
            }
        });

        // Listen for authentication errors
        this.socket.on("auth-error", (error: { message: string; reason?: string }) => {
            this.logger.error(`Authentication failed: ${error.message} ${error.reason ? `(${error.reason})` : ""}`);
            this.emit("error", new Error(`Authentication failed: ${error.message}`));
        });

        if (this.socket.connected) {
            this.logger.info("Already connected to iMessage server");
            return;
        }

        this.socket.once("connect", () => {
            this.logger.info("Connected to iMessage server, waiting for authentication...");
            // If no apiKey, assume legacy server that doesn't require auth - emit ready immediately
            if (!this.config.apiKey) {
                this.logger.info("No API key provided, skipping authentication (legacy server mode)");
                if (!this.readyEmitted) {
                    this.readyEmitted = true;
                    this.emit("ready");
                }
            }
        });

        if (!this.socket.connected) {
            this.socket.connect();
        }
    }

    async close() {
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

    /**
     * Enqueue a send operation to ensure sequential delivery.
     * All send operations (messages, attachments, stickers) should use this method
     * to guarantee order for a single user.
     * @param task The async send operation to enqueue
     * @returns Promise that resolves with the task result
     */
    public enqueueSend<T>(task: () => Promise<T>): Promise<T> {
        const result = this.sendQueue.then(() => task());
        // Update queue, swallow errors to not block subsequent sends
        this.sendQueue = result.catch(() => {});
        return result;
    }
}

export const SDK = AdvancedIMessageKit.getInstance;
