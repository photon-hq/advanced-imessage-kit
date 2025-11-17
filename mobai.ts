import { EventEmitter } from "node:events";
import axios, { type AxiosInstance } from "axios";
import io from "socket.io-client";
import type { Message } from "./interfaces";
import { getLogger, setGlobalLogLevel } from "./lib/Loggable";
import type { LogLevel } from "./lib/Logger";
import { MessageChain } from "./lib/MessageChain";
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

/**
 * Event handler types
 */
export interface WatcherEvents {
    /** New message event */
    onNewMessage?: (message: Message) => void | Promise<void>;
    /** Message updated event (read, delivered, etc.) */
    onMessageUpdated?: (message: Message) => void | Promise<void>;
    /** Group name changed */
    onGroupNameChange?: (data: any) => void | Promise<void>;
    /** Participant added */
    onParticipantAdded?: (data: any) => void | Promise<void>;
    /** Participant removed */
    onParticipantRemoved?: (data: any) => void | Promise<void>;
    /** Participant left */
    onParticipantLeft?: (data: any) => void | Promise<void>;
    /** Group icon changed */
    onGroupIconChanged?: (data: any) => void | Promise<void>;
    /** Group icon removed */
    onGroupIconRemoved?: (data: any) => void | Promise<void>;
    /** Message send error */
    onMessageSendError?: (error: any) => void | Promise<void>;
    /** Typing indicator */
    onTypingIndicator?: (data: any) => void | Promise<void>;
    /** Error event */
    onError?: (error: Error) => void;
    /** Disconnected */
    onDisconnect?: () => void;
}

/**
 * Advanced iMessage Kit - Core SDK Class
 *
 * Provides concise API for iMessage automation
 *
 * @example
 * ```ts
 * const sdk = new AdvancedIMessageKit({
 *   serverUrl: 'http://localhost:1234'
 * })
 *
 * // Send message
 * await sdk.send('chat123', 'Hello!')
 *
 * // Watch messages
 * await sdk.startWatching({
 *   onNewMessage: async (msg) => {
 *     await sdk.message(msg)
 *       .ifFromOthers()
 *       .replyText('Hi!')
 *       .execute()
 *   }
 * })
 * ```
 */
export class AdvancedIMessageKit {
    /** Configuration */
    private readonly config: Required<ClientConfig>;

    /** Logger */
    private readonly logger = getLogger("AdvancedIMessageKit");

    /** HTTP client */
    private readonly http: AxiosInstance;

    /** Socket.IO client - lazy initialized */
    private socket: ReturnType<typeof io> | null = null;

    /** Internal event bus */
    private readonly eventBus: EventEmitter;

    /** Internal modules - completely private, not accessible externally */
    private readonly attachments: AttachmentModule;
    private readonly messages: MessageModule;
    private readonly chats: ChatModule;
    private readonly contacts: ContactModule;
    private readonly handles: HandleModule;
    private readonly facetime: FaceTimeModule;
    private readonly icloud: ICloudModule;
    private readonly scheduledMessages: ScheduledMessageModule;
    private readonly server: ServerModule;

    /** Message deduplication */
    private processedMessages = new Set<string>();

    /** Connection state */
    private connected = false;
    private connecting = false;

    /** Watching state */
    private watching = false;

    /** Registered socket event handlers for cleanup */
    private socketEventHandlers = new Map<string, (...args: any[]) => void>();

    /** Registered event bus handlers for cleanup */
    private eventBusHandlers = new Map<string, ((...args: any[]) => void | Promise<void>)[]>();

    constructor(config: ClientConfig = {}) {
        this.config = {
            serverUrl: config.serverUrl || "http://localhost:1234",
            logLevel: config.logLevel || "info",
        };

        if (this.config.logLevel) {
            setGlobalLogLevel(this.config.logLevel as LogLevel);
        }

        this.http = axios.create({
            baseURL: this.config.serverUrl,
            timeout: 30000,
        });

        this.eventBus = new EventEmitter();
        this.eventBus.setMaxListeners(100);

        // Initialize modules
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

    /**
     * Connect to server
     */
    async connect(): Promise<void> {
        // Already connected
        if (this.connected) {
            this.logger.info("Already connected to iMessage server");
            return;
        }

        // Connection in progress
        if (this.connecting) {
            this.logger.info("Connection already in progress");
            // Wait for current connection attempt
            return new Promise((resolve, reject) => {
                const checkInterval = setInterval(() => {
                    if (this.connected) {
                        clearInterval(checkInterval);
                        clearTimeout(timeoutId);
                        resolve();
                    } else if (!this.connecting) {
                        clearInterval(checkInterval);
                        clearTimeout(timeoutId);
                        reject(new Error("Connection failed"));
                    }
                }, 100);

                // Timeout after 10 seconds
                const timeoutId = setTimeout(() => {
                    clearInterval(checkInterval);
                    if (!this.connected) {
                        reject(new Error("Connection timeout"));
                    }
                }, 10000);
            });
        }

        this.connecting = true;

        try {
            // Create socket if not exists
            if (!this.socket) {
                this.socket = io(this.config.serverUrl, {
                    transports: ["websocket"],
                    timeout: 10000,
                    autoConnect: false,
                });
            }

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    this.connecting = false;
                    reject(new Error("Connection timeout"));
                }, 10000);

                this.socket!.once("connect", () => {
                    clearTimeout(timeout);
                    this.connected = true;
                    this.connecting = false;
                    this.logger.info("Connected to iMessage server");
                    resolve();
                });

                this.socket!.once("connect_error", (error) => {
                    clearTimeout(timeout);
                    this.connecting = false;
                    this.logger.error(`Connection failed: ${error}`);
                    reject(error);
                });

                this.socket!.connect();
            });
        } catch (error) {
            this.connecting = false;
            throw error;
        }
    }

    /**
     * Disconnect from server
     */
    async disconnect(): Promise<void> {
        // Set flags first to prevent new operations
        const wasConnected = this.connected;
        this.connected = false;
        this.connecting = false;

        if (!wasConnected && !this.socket) {
            return; // Already disconnected
        }

        // Stop watching first
        if (this.watching) {
            await this.stopWatching();
        }

        // Disconnect and destroy socket
        if (this.socket) {
            this.socket.disconnect();
            this.socket.removeAllListeners();
            this.socket = null;
        }

        // Clear state
        this.processedMessages.clear();

        this.logger.info("Disconnected from iMessage server");
    }

    /**
     * Close SDK and release resources (alias for disconnect)
     */
    async close(): Promise<void> {
        await this.disconnect();
    }

    // ==================== Message Sending ====================

    /** Send message to chat */
    async send(
        chatGuid: string,
        content: string | { text?: string; effectId?: string; subject?: string },
    ): Promise<Message> {
        // Validate chatGuid
        if (!chatGuid || typeof chatGuid !== "string") {
            throw new Error("chatGuid is required and must be a string");
        }

        const trimmedGuid = chatGuid.trim();
        if (trimmedGuid === "" || trimmedGuid.length > 500) {
            throw new Error("chatGuid must be between 1 and 500 characters");
        }

        // Normalize content
        const normalized =
            typeof content === "string"
                ? { message: content.trim(), effectId: undefined, subject: undefined }
                : {
                      message: content.text?.trim() ?? "",
                      effectId: content.effectId,
                      subject: content.subject?.trim(),
                  };

        // Validate message content length
        if (normalized.message && normalized.message.length > 100000) {
            throw new Error("Message text cannot exceed 100,000 characters");
        }
        if (normalized.subject && normalized.subject.length > 1000) {
            throw new Error("Subject cannot exceed 1,000 characters");
        }

        // Validate message content - at least one field must have meaningful content
        const hasMessage = normalized.message && normalized.message.length > 0;
        const hasEffect = normalized.effectId && normalized.effectId.trim().length > 0;
        const hasSubject = normalized.subject && normalized.subject.length > 0;

        if (!hasMessage && !hasEffect && !hasSubject) {
            throw new Error("Message content cannot be empty (text, effectId, or subject required)");
        }

        return await this.messages.sendMessage({
            chatGuid: trimmedGuid,
            message: normalized.message,
            effectId: normalized.effectId,
            subject: normalized.subject,
        });
    }

    // Send file to specified chat
    async sendFile(chatGuid: string, filePath: string, text?: string): Promise<void> {
        // Validate inputs
        if (!chatGuid || typeof chatGuid !== "string" || chatGuid.trim() === "") {
            throw new Error("chatGuid is required and must be a non-empty string");
        }
        if (!filePath || typeof filePath !== "string" || filePath.trim() === "") {
            throw new Error("filePath is required and must be a non-empty string");
        }

        try {
            // Send text first if provided
            if (text) {
                await this.send(chatGuid, text);
            }

            // Send attachment
            await this.attachments.sendAttachment({
                chatGuid,
                filePath,
            });
        } catch (error) {
            this.logger.error(`Failed to send file: ${error}`);
            throw error;
        }
    }

    // Send multiple files to specified chat
    async sendFiles(chatGuid: string, filePaths: string[], text?: string): Promise<void> {
        // Validate inputs
        if (!chatGuid || typeof chatGuid !== "string" || chatGuid.trim() === "") {
            throw new Error("chatGuid is required and must be a non-empty string");
        }
        if (!Array.isArray(filePaths) || filePaths.length === 0) {
            throw new Error("filePaths must be a non-empty array");
        }

        try {
            // Send text first if provided
            if (text) {
                await this.send(chatGuid, text);
            }

            // Send all attachments
            for (const filePath of filePaths) {
                if (!filePath || typeof filePath !== "string" || filePath.trim() === "") {
                    this.logger.warn(`Skipping invalid file path: ${filePath}`);
                    continue;
                }
                await this.attachments.sendAttachment({
                    chatGuid,
                    filePath,
                });
            }
        } catch (error) {
            this.logger.error(`Failed to send files: ${error}`);
            throw error;
        }
    }

    // Batch send messages
    async sendBatch(
        messages: Array<{
            chatGuid: string;
            content: string | { text?: string; effectId?: string; subject?: string };
        }>,
    ): Promise<
        Array<{
            chatGuid: string;
            success: boolean;
            result?: Message;
            error?: Error;
        }>
    > {
        // Validate input
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new Error("messages must be a non-empty array");
        }
        if (messages.length > 1000) {
            throw new Error("Cannot send more than 1000 messages in a single batch");
        }

        const results = await Promise.allSettled(
            messages.map(async ({ chatGuid, content }) => {
                const message = await this.send(chatGuid, content);
                return { chatGuid, message };
            }),
        );

        return results.map((result, index) => {
            const chatGuid = messages[index]!.chatGuid;

            if (result.status === "fulfilled") {
                return {
                    chatGuid,
                    success: true,
                    result: result.value.message,
                };
            }
            return {
                chatGuid,
                success: false,
                error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
            };
        });
    }

    // Create message processing chain
    message(message: Message): MessageChain {
        return new MessageChain(message, this);
    }

    // Get all chats list
    async listChats() {
        return await this.chats.getChats();
    }

    // Get messages from specified chat
    async getMessages(chatGuid: string, options?: { offset?: number; limit?: number; sort?: "ASC" | "DESC" }) {
        return await this.chats.getChatMessages(chatGuid, options);
    }

    // Get unread message count
    async getUnreadCount(): Promise<number> {
        const stats = await this.server.getMessageStats();
        return stats?.unreadCount ?? 0;
    }

    // Start watching messages
    async startWatching(events: WatcherEvents = {}): Promise<void> {
        if (this.watching) {
            this.logger.warn("Already watching for messages");
            return;
        }

        // Set watching flag immediately to prevent race condition
        this.watching = true;

        try {
            // Ensure connected
            if (!this.connected) {
                await this.connect();
            }

            if (!this.socket) {
                throw new Error("Socket not initialized");
            }

            // Clear any existing socket event handlers to prevent duplicates
            this.socketEventHandlers.forEach((handler, eventName) => {
                this.socket!.off(eventName, handler);
            });
            this.socketEventHandlers.clear();

            // Setup server event listeners
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
            ];

            for (const eventName of serverEvents) {
                const handler = (...args: any[]) => {
                    // Message deduplication (only for new-message event)
                    if (eventName === "new-message" && args.length > 0) {
                        const message = args[0];
                        if (message?.guid) {
                            if (this.processedMessages.has(message.guid)) {
                                this.logger.debug(`Message already processed: ${message.guid}`);
                                return;
                            }
                            this.processedMessages.add(message.guid);

                            // Auto-cleanup if too many processed messages
                            if (this.processedMessages.size > 10000) {
                                this.clearProcessedMessages(5000);
                            }
                        }
                    }

                    // Trigger internal event
                    this.eventBus.emit(eventName, ...args);
                };

                this.socket!.on(eventName, handler);
                this.socketEventHandlers.set(eventName, handler);
            }

            // Clear previous event bus handlers
            this.eventBusHandlers.forEach((handlers, eventName) => {
                handlers.forEach((handler) => {
                    this.eventBus.off(eventName, handler);
                });
            });
            this.eventBusHandlers.clear();

            // Connect user event handlers to internal event bus and track them
            const registerEventBusHandler = (eventName: string, handler: (...args: any[]) => void | Promise<void>) => {
                this.eventBus.on(eventName, handler);
                if (!this.eventBusHandlers.has(eventName)) {
                    this.eventBusHandlers.set(eventName, []);
                }
                this.eventBusHandlers.get(eventName)!.push(handler);
            };

            if (events.onNewMessage) {
                registerEventBusHandler("new-message", events.onNewMessage);
            }
            if (events.onMessageUpdated) {
                registerEventBusHandler("updated-message", events.onMessageUpdated);
                registerEventBusHandler("message-updated", events.onMessageUpdated);
            }
            if (events.onGroupNameChange) {
                registerEventBusHandler("group-name-change", events.onGroupNameChange);
            }
            if (events.onParticipantAdded) {
                registerEventBusHandler("participant-added", events.onParticipantAdded);
            }
            if (events.onParticipantRemoved) {
                registerEventBusHandler("participant-removed", events.onParticipantRemoved);
            }
            if (events.onParticipantLeft) {
                registerEventBusHandler("participant-left", events.onParticipantLeft);
            }
            if (events.onGroupIconChanged) {
                registerEventBusHandler("group-icon-changed", events.onGroupIconChanged);
            }
            if (events.onGroupIconRemoved) {
                registerEventBusHandler("group-icon-removed", events.onGroupIconRemoved);
            }
            if (events.onMessageSendError) {
                registerEventBusHandler("message-send-error", events.onMessageSendError);
            }
            if (events.onTypingIndicator) {
                registerEventBusHandler("typing-indicator", events.onTypingIndicator);
            }
            if (events.onError) {
                const errorHandler = (error: Error) => events.onError!(error);
                this.socket!.on("error", errorHandler);
                this.socketEventHandlers.set("error", errorHandler);
            }
            if (events.onDisconnect) {
                const disconnectHandler = () => events.onDisconnect!();
                this.socket!.on("disconnect", disconnectHandler);
                this.socketEventHandlers.set("disconnect", disconnectHandler);
            }

            this.logger.info("Started watching for messages");
        } catch (error) {
            this.watching = false;
            this.logger.error(`Failed to start watching: ${error}`);
            throw error;
        }
    }

    // Stop watching messages
    async stopWatching(): Promise<void> {
        if (!this.watching) {
            return;
        }

        this.watching = false;

        // Remove only the socket event handlers we registered
        if (this.socket) {
            this.socketEventHandlers.forEach((handler, eventName) => {
                this.socket!.off(eventName, handler);
            });
            this.socketEventHandlers.clear();
        }

        // Remove only the event bus listeners we registered
        this.eventBusHandlers.forEach((handlers, eventName) => {
            handlers.forEach((handler) => {
                this.eventBus.off(eventName, handler);
            });
        });
        this.eventBusHandlers.clear();

        this.logger.info("Stopped watching for messages");
    }

    // Edit sent message
    async editMessage(messageGuid: string, newText: string): Promise<void> {
        await this.messages.editMessage({
            messageGuid,
            editedMessage: newText,
        });
    }

    // Unsend sent message
    async unsendMessage(messageGuid: string): Promise<void> {
        await this.messages.unsendMessage({
            messageGuid,
        });
    }

    // Add reaction (tapback) to message
    async reactToMessage(chatGuid: string, messageGuid: string, reaction: string): Promise<void> {
        await this.messages.sendReaction({
            chatGuid,
            messageGuid,
            reaction,
        });
    }

    // Add participant to group chat
    async addParticipant(chatGuid: string, participant: string): Promise<void> {
        await this.chats.addParticipant(chatGuid, participant);
    }

    // Remove participant from group chat
    async removeParticipant(chatGuid: string, participant: string): Promise<void> {
        await this.chats.removeParticipant(chatGuid, participant);
    }

    // Rename group chat
    async renameGroup(chatGuid: string, newName: string): Promise<void> {
        await this.chats.updateChat(chatGuid, { displayName: newName });
    }

    // Set group chat icon
    async setGroupIcon(chatGuid: string, iconPath: string): Promise<void> {
        await this.chats.setGroupIcon(chatGuid, iconPath);
    }

    // Remove group chat icon
    async removeGroupIcon(chatGuid: string): Promise<void> {
        await this.chats.removeGroupIcon(chatGuid);
    }

    // Get all contacts
    async getContacts() {
        return await this.contacts.getContacts();
    }

    // Search contacts (client-side filtering - server should implement search API for better performance)
    async searchContacts(query: string) {
        if (!query || typeof query !== "string") {
            throw new Error("query must be a non-empty string");
        }

        const normalizedQuery = query.toLowerCase().trim();
        if (normalizedQuery === "") {
            return [];
        }

        const all = await this.contacts.getContacts();
        const lowerQuery = normalizedQuery;
        
        return all.filter((contact: any) => {
            if (contact.displayName?.toLowerCase().includes(lowerQuery)) return true;
            if (contact.phoneNumbers?.some((phone: string) => phone.includes(lowerQuery))) return true;
            if (contact.emails?.some((email: string) => email.toLowerCase().includes(lowerQuery))) return true;
            return false;
        });
    }

    // Get server information
    async getServerInfo() {
        return await this.server.getServerInfo();
    }

    // Clear processed message records (prevent memory leaks)
    clearProcessedMessages(maxSize: number = 1000): void {
        if (maxSize <= 0) {
            this.logger.warn("maxSize must be positive, ignoring clear request");
            return;
        }

        if (this.processedMessages.size > maxSize) {
            const messages = Array.from(this.processedMessages);
            this.processedMessages.clear();

            // Keep 80% of maxSize (most recent messages)
            const keepCount = Math.floor(maxSize * 0.8);
            if (keepCount > 0) {
                messages.slice(-keepCount).forEach((guid) => {
                    this.processedMessages.add(guid);
                });
            }
            this.logger.debug(`Cleared processed messages, retained ${this.processedMessages.size}`);
        }
    }

    // Start typing indicator
    async startTyping(chatGuid: string): Promise<void> {
        await this.chats.startTyping(chatGuid);
    }

    // Stop typing indicator
    async stopTyping(chatGuid: string): Promise<void> {
        await this.chats.stopTyping(chatGuid);
    }

    // Get message statistics
    async getMessageStats() {
        return await this.server.getMessageStats();
    }

    // Create scheduled message
    async createScheduledMessage(chatGuid: string, message: string, scheduledFor: Date) {
        return await this.scheduledMessages.createScheduledMessage({
            chatGuid,
            message,
            scheduledFor,
            schedule: { type: "once" },
        });
    }

    // Create recurring scheduled message
    async createRecurringMessage(chatGuid: string, message: string, scheduledFor: Date, schedule: any) {
        return await this.scheduledMessages.createScheduledMessage({
            chatGuid,
            message,
            scheduledFor,
            schedule: { type: "recurring", ...schedule },
        });
    }

    // Get scheduled messages
    async getScheduledMessages() {
        return await this.scheduledMessages.getScheduledMessages();
    }

    // Check handle availability (iMessage/FaceTime)
    async checkHandleAvailability(handle: string, service: "imessage" | "facetime") {
        return await this.handles.getHandleAvailability(handle, service);
    }

    // Create FaceTime link
    async createFaceTimeLink() {
        return await this.facetime.createFaceTimeLink();
    }

    // Get Find My Friends
    async getFindMyFriends() {
        return await this.icloud.getFindMyFriends();
    }

    // Get Find My Devices
    async getFindMyDevices() {
        return await this.icloud.getFindMyDevices();
    }

    // ==================== Event Emitter Methods ====================

    // Add event listener
    on(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.eventBus.on(eventName, listener);
        return this;
    }

    // Remove event listener
    off(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.eventBus.off(eventName, listener);
        return this;
    }

    // Emit event
    emit(eventName: string | symbol, ...args: any[]): boolean {
        return this.eventBus.emit(eventName, ...args);
    }

    // Remove all listeners
    removeAllListeners(event?: string | symbol): this {
        this.eventBus.removeAllListeners(event);
        return this;
    }

    // Get all event names
    eventNames(): Array<string | symbol> {
        return this.eventBus.eventNames();
    }

    // Add one-time event listener
    once(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.eventBus.once(eventName, listener);
        return this;
    }
}

/**
 * Legacy SDK factory function for compatibility
 * @deprecated Use new AdvancedIMessageKit() instead
 */
export const SDK = (config?: ClientConfig) => {
    if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
        console.warn("[AdvancedIMessageKit] SDK() is deprecated. Use 'new AdvancedIMessageKit()' instead.");
    }
    return new AdvancedIMessageKit(config);
};
