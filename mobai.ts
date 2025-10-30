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
    public readonly socket: ReturnType<typeof io>;

    // Modules
    public readonly attachments: AttachmentModule;
    public readonly chats: ChatModule;
    public readonly contacts: ContactModule;
    public readonly facetime: FaceTimeModule;
    public readonly icloud: ICloudModule;
    public readonly messages: MessageModule;
    public readonly scheduledMessages: ScheduledMessageModule;
    public readonly server: ServerModule;

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

        this.http = axios.create({
            baseURL: this.config.serverUrl,
        });

        this.socket = io(this.config.serverUrl);

        this.attachments = new AttachmentModule(this.http);
        this.chats = new ChatModule(this.http);
        this.contacts = new ContactModule(this.http);
        this.facetime = new FaceTimeModule(this.http);
        this.icloud = new ICloudModule(this.http);
        this.messages = new MessageModule(this.http);
        this.scheduledMessages = new ScheduledMessageModule(this.http);
        this.server = new ServerModule(this.http);
    }

    async connect() {
        this.socket.on("connect", () => {
            this.logger.info("Connected to iMessage server");
            this.emit("ready");
        });

        this.socket.on("disconnect", () => {
            this.logger.info("Disconnected from iMessage server");
            this.emit("disconnect");
        });

        const serverEvents = [
            "new-message",
            "message-updated",
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
    }

    async disconnect() {
        this.socket.disconnect();
    }
}

export const SDK = AdvancedIMessageKit.getInstance;
