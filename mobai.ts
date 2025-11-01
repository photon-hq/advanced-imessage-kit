import { EventEmitter } from "node:events";
import axios, { type AxiosInstance } from "axios";
import io from "socket.io-client";
import { getLogger, setGlobalLogLevel } from "./lib/Loggable";
import type { LogLevel } from "./lib/Logger";
import { WebSocketAdapter } from "./lib/WebSocketAdapter";
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
import type { ClientConfig } from "./types";

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
    public readonly http: AxiosInstance;
    public readonly socket: ReturnType<typeof io> | WebSocketAdapter;

    public readonly attachments: AttachmentModule;
    public readonly messages: MessageModule;
    public readonly chats: ChatModule;

    public readonly contacts: ContactModule;
    public readonly handles: HandleModule;

    public readonly facetime: FaceTimeModule;
    public readonly icloud: ICloudModule;

    public readonly scheduledMessages: ScheduledMessageModule;
    public readonly server: ServerModule;

    private constructor(config: ClientConfig = {}) {
        super();

        this.config = {
            serverUrl: "http://localhost:1234",
            logLevel: "info",
            connectionMode: "socket.io",
            ...config,
        };

        if (this.config.logLevel) {
            setGlobalLogLevel(this.config.logLevel as LogLevel);
        }

        // Determine base URL for HTTP requests
        const serverUrl = this.config.serverUrl || "http://localhost:1234";
        let httpBaseURL = serverUrl;
        if (this.config.connectionMode === "websocket") {
            // For WebSocket mode, convert wss:// to https:// and remove /ws/{uuid} path
            httpBaseURL = serverUrl
                .replace(/\/ws\/[^/]+$/, "")
                .replace(/^wss:\/\//, "https://")
                .replace(/^ws:\/\//, "http://");
        }

        this.http = axios.create({
            baseURL: httpBaseURL,
        });

        // Initialize socket based on connection mode
        if (this.config.connectionMode === "websocket") {
            let wsUrl: string;
            if (serverUrl.startsWith("ws://") || serverUrl.startsWith("wss://")) {
                wsUrl = serverUrl;
            } else if (this.config.websocketUUID) {
                wsUrl = `${serverUrl.replace(/^http/, "ws")}/ws/${this.config.websocketUUID}`;
            } else {
                throw new Error("websocketUUID is required when connectionMode is 'websocket' and serverUrl is not a WebSocket URL");
            }
            this.socket = new WebSocketAdapter(wsUrl);
        } else {
        this.socket = io(serverUrl);
        }

        this.attachments = new AttachmentModule(this.http);
        this.messages = new MessageModule(this.http);
        this.chats = new ChatModule(this.http);

        this.contacts = new ContactModule(this.http);
        this.handles = new HandleModule(this.http);

        this.facetime = new FaceTimeModule(this.http);
        this.icloud = new ICloudModule(this.http);

        this.scheduledMessages = new ScheduledMessageModule(this.http);
        this.server = new ServerModule(this.http);
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
                this.emit(eventName, ...args);
            });
        }

        this.socket.on("disconnect", () => {
            this.logger.info("Disconnected from iMessage server");
            this.emit("disconnect");
        });

        // Check connection status (socket.io has 'connected' property, WebSocketAdapter has getter)
        const isConnected = this.config.connectionMode === "websocket" 
            ? (this.socket as WebSocketAdapter).connected
            : (this.socket as ReturnType<typeof io>).connected;

        if (isConnected) {
            this.logger.info("Already connected to iMessage server");
            this.emit("ready");
            return;
        }

        this.socket.once("connect", () => {
            this.logger.info("Connected to iMessage server");
            this.emit("ready");
        });

        if (!isConnected) {
            if (this.config.connectionMode === "websocket") {
                (this.socket as WebSocketAdapter).connect();
            } else {
                (this.socket as ReturnType<typeof io>).connect();
            }
        }
    }

    async disconnect() {
        if (this.config.connectionMode === "websocket") {
            (this.socket as WebSocketAdapter).disconnect();
        } else {
            (this.socket as ReturnType<typeof io>).disconnect();
        }
    }
}

export const SDK = AdvancedIMessageKit.getInstance;
