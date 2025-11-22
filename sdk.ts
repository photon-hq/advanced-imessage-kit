import type { EventEmitter } from "node:events";
import { RemoteClient } from "./remoteClient";
import { NEW_MESSAGE } from "./events";
import type { PluginManager, Plugin } from "./plugins/core";
import { PluginManager as CorePluginManager } from "./plugins/core";
import type { IMessageConfig, ResolvedConfig } from "./types/config";
import type { Message, SendMessageOptions } from "./types/message";
import type { Chat } from "./types/chat";
import type {
    SendResult,
    MessageQueryOptions,
    MessageQueryResult,
    ListChatsOptions,
    ChatSummary,
    UnreadMessagesResult,
} from "./types/sdk";
import type {
    ClientConfig,
    SendAttachmentOptions,
    SendStickerOptions,
    QueuedAttachmentResult,
    CreateScheduledMessageOptions,
    ScheduledMessage,
    UpdateScheduledMessageOptions,
} from "./types";

/** Callback type used by watcher-based APIs. */
export type MessageCallback = (message: Message) => void | Promise<void>;

/** High-level watcher callbacks exposed by `startWatching`. */
export interface WatcherEvents {
    /** Called for every new message (both direct and group chats). */
    onMessage?: MessageCallback;
    /** Called only for direct (one-to-one) messages. */
    onDirectMessage?: MessageCallback;
    /** Called only for group chat messages. */
    onGroupMessage?: MessageCallback;
    /** Called when an error occurs in watcher or plugin processing. */
    onError?: (error: Error) => void;
}

/**
 * High-level public SDK for interacting with an Advanced iMessage Kit server.
 *
 * This class mirrors the surface of the primary `imessage-kit-main` SDK while
 * delegating all transport details to `RemoteClient` (a Socket.IO client).
 *
 * Typical usage:
 * - const sdk = new IMessageSDK(config)
 * - await sdk.connect()
 * - await sdk.send("any;-;+1234567890", "Hello World!")
 * - await sdk.close()
 */
export class IMessageSDK {
    /** Resolved configuration for this SDK instance. */
    private readonly config: ResolvedConfig;

    /** Internal Socket.IO transport client and event emitter. */
    private readonly client: RemoteClient & EventEmitter;

    /** Plugin manager responsible for running lifecycle hooks. */
    private readonly pluginManager: PluginManager;

    /** Whether the watcher API has been started. */
    private watcherStarted = false;

    /** User-provided watcher callbacks. */
    private watcherEvents: WatcherEvents | undefined;

    /** Bound NEW_MESSAGE handler, so we can safely remove the listener. */
    private readonly boundHandleNewMessage: (message: Message) => void;

    /** Whether `close()` has been called on this SDK instance. */
    private closed = false;

    constructor(config: IMessageConfig) {
        this.config = {
            serverUrl: config.serverUrl,
            logLevel: config.logLevel ?? "info",
            apiKey: config.apiKey,
            plugins: config.plugins ?? [],
            watcher: {
                excludeOwnMessages: config.watcher?.excludeOwnMessages ?? true,
            },
        };

        const clientConfig: ClientConfig = {
            serverUrl: this.config.serverUrl,
            logLevel: this.config.logLevel,
            apiKey: this.config.apiKey,
        };

        this.client = RemoteClient.getInstance(clientConfig) as RemoteClient & EventEmitter;
        this.pluginManager = new CorePluginManager();

        for (const plugin of this.config.plugins) {
            this.pluginManager.use(plugin as Plugin);
        }

        this.boundHandleNewMessage = (message: Message) => {
            void this.handleNewMessage(message).catch((error) => {
                this.handleError(error);
            });
        };
    }

    /** Expose the plugin manager, matching the imessage-kit-main SDK. */
    get plugins(): PluginManager {
        return this.pluginManager;
    }

    /** Ensure that all plugins are initialized before performing work. */
    private async ensurePluginsReady() {
        if (!this.pluginManager.initialized) {
            await this.pluginManager.init();
        }
    }

    /** Throw if this SDK instance has already been closed. */
    private ensureNotClosed() {
        if (this.closed) {
            throw new Error(
                "IMessageSDK instance has been closed. Create a new instance to continue using the SDK.",
            );
        }
    }

    /** Establish a Socket.IO connection and initialize plugins. */
    async connect(): Promise<void> {
        this.ensureNotClosed();

        await this.client.connect();
        await this.ensurePluginsReady();
    }

    /** Disconnect from the underlying Socket.IO client. */
    async disconnect(): Promise<void> {
        this.ensureNotClosed();
        await this.client.disconnect();
    }

    /** Subscribe to low-level events forwarded from the underlying client. */
    on(event: string, listener: (...args: any[]) => void): this {
        this.ensureNotClosed();
        this.client.on(event, listener);
        return this;
    }

    /** Unsubscribe a previously registered event listener. */
    off(event: string, listener: (...args: any[]) => void): this {
        this.ensureNotClosed();
        this.client.off(event, listener);
        return this;
    }

    /** Remove listeners for an event or for all events. */
    removeAllListeners(event?: string): this {
        this.ensureNotClosed();
        if (event) {
            this.client.removeAllListeners(event);
        } else {
            this.client.removeAllListeners();
        }
        return this;
    }

    /**
     * Query messages with optional filters.
     *
     * - Mirrors the semantics of `getMessages` in imessage-kit-main.
     * - Returns a convenience `unreadCount` computed from the result set.
     */
    async getMessages(options: MessageQueryOptions = {}): Promise<MessageQueryResult> {
        this.ensureNotClosed();
        await this.ensurePluginsReady();
        await this.pluginManager.callHookForAll("onBeforeQuery", options);

        const messages = await this.client.messages.getMessages({
            chatGuid: options.chatGuid,
            offset: options.offset,
            limit: options.limit,
            after: options.after,
            before: options.before,
            withChats: options.withChats,
            withChatParticipants: options.withChatParticipants,
            withAttachments: options.withAttachments,
            sort: options.sort,
            where: options.where,
        });

        const unreadCount = messages.filter((m) => !m.isFromMe && !m.dateRead).length;

        const result: MessageQueryResult = {
            messages,
            total: messages.length,
            unreadCount,
        };

        await this.pluginManager.callHookForAll("onAfterQuery", messages);

        return result;
    }

    /**
     * Convenience helper that returns unread messages grouped by sender.
     *
     * Note: this operates on a recent window of messages, not a full
     * database-wide aggregation.
     */
    async getUnreadMessages(): Promise<UnreadMessagesResult> {
        this.ensureNotClosed();

        const { messages } = await this.getMessages({
            limit: 500,
            sort: "DESC",
        });

        const unread = messages.filter((m) => !m.isFromMe && !m.dateRead);
        const groupsMap = new Map<string, Message[]>();

        for (const msg of unread) {
            const sender = msg.handle?.address ?? "(unknown)";
            const existing = groupsMap.get(sender) ?? [];
            existing.push(msg);
            groupsMap.set(sender, existing);
        }

        const groups = Array.from(groupsMap.entries()).map(([sender, groupedMessages]) => ({
            sender,
            messages: groupedMessages,
        }));

        return {
            groups,
            total: unread.length,
            senderCount: groups.length,
        };
    }

    async getMessage(guid: string, options?: { with?: string[] }): Promise<Message> {
        this.ensureNotClosed();
        return this.client.messages.getMessage(guid, options as any);
    }

    async getMessageCount(options?: unknown): Promise<number> {
        this.ensureNotClosed();
        return this.client.messages.getMessageCount(options as any);
    }

    async getUpdatedMessageCount(options?: unknown): Promise<number> {
        this.ensureNotClosed();
        return this.client.messages.getUpdatedMessageCount(options as any);
    }

    async getSentMessageCount(options?: unknown): Promise<number> {
        this.ensureNotClosed();
        return this.client.messages.getSentMessageCount(options as any);
    }

    /**
     * High-level helper for sending a message to either a chat GUID or an
     * address (phone number / email).
     *
     * - `to` can be either an address or a chat GUID.
     * - `content` can be a string or an object with text / images / files.
     */
    async send(
        to: string,
        content: string | { text?: string; images?: string[]; files?: string[] },
    ): Promise<SendResult> {
        this.ensureNotClosed();
        await this.ensurePluginsReady();

        const normalized =
            typeof content === "string"
                ? { text: content, attachments: [] as string[] }
                : {
                      text: content.text,
                      attachments: [...(content.images || []), ...(content.files || [])],
                  };

        const sentAt = new Date();

        await this.pluginManager.callHookForAll("onBeforeSend", to, {
            text: normalized.text,
            attachments: normalized.attachments,
        });

        let message: Message | undefined;

        try {
            // If `to` already looks like a chat GUID (or multi-address
            // identifier), send directly to that chat.
            if (this.looksLikeChatGuid(to)) {
                const chatGuid = to;

                if (normalized.text) {
                    message = await this.client.messages.sendMessage({
                        chatGuid,
                        message: normalized.text,
                    });
                }

                for (const filePath of normalized.attachments) {
                    await this.client.attachments.sendAttachment({
                        chatGuid,
                        filePath,
                    });
                }
            } else {
                // Otherwise treat `to` as a single address: create or fetch a
                // chat, optionally sending an initial text message.
                const chat = await this.client.chats.createChat({
                    addresses: [to],
                    message: normalized.text,
                    service: "iMessage",
                });

                const chatGuid = chat.guid;

                // `start-chat` may already send the initial text message; here
                // we only send any remaining attachments.
                if (normalized.attachments.length > 0) {
                    for (const filePath of normalized.attachments) {
                        await this.client.attachments.sendAttachment({
                            chatGuid,
                            filePath,
                        });
                    }
                }
            }

            const result: SendResult = { sentAt, message };

            await this.pluginManager.callHookForAll("onAfterSend", to, result);

            return result;
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            await this.pluginManager.callHookForAll("onError", err, "send");
            throw err;
        }
    }

    async sendFile(to: string, filePath: string, text?: string): Promise<SendResult> {
        return this.send(to, { text, files: [filePath] });
    }

    async sendFiles(to: string, filePaths: string[], text?: string): Promise<SendResult> {
        return this.send(to, { text, files: filePaths });
    }

    async sendBatch(
        messages: Array<{
            to: string;
            content: string | { text?: string; images?: string[]; files?: string[] };
        }>,
    ): Promise<
        Array<{
            to: string;
            success: boolean;
            result?: SendResult;
            error?: Error;
        }>
    > {
        const results = await Promise.allSettled(
            messages.map(async ({ to, content }) => ({
                to,
                result: await this.send(to, content),
            })),
        );

        return results.map((result, index) => {
            const to = messages[index]!.to;

            if (result.status === "fulfilled") {
                return {
                    to,
                    success: true,
                    result: result.value.result,
                };
            }

            return {
                to,
                success: false,
                error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
            };
        });
    }

    message(message: Message): MessageChain {
        return new MessageChain(message, this);
    }

    /**
     * List chat summaries with optional filtering.
     *
     * - Supports filtering by type (all / group / dm), search, and limit.
     */
    async listChats(options?: ListChatsOptions | number): Promise<ChatSummary[]> {
        this.ensureNotClosed();
        await this.ensurePluginsReady();

        const opts: ListChatsOptions = typeof options === "number" ? { limit: options } : options || {};
        await this.pluginManager.callHookForAll("onBeforeQuery", opts);

        const chats = await this.client.chats.getChats();

        let filtered = chats;

        if (opts.type === "group") {
            filtered = filtered.filter((chat) => this.isGroupChatByChat(chat));
        } else if (opts.type === "dm") {
            filtered = filtered.filter((chat) => !this.isGroupChatByChat(chat));
        }

        if (opts.search) {
            const q = opts.search.toLowerCase();
            filtered = filtered.filter((chat) => {
                const name = chat.displayName ?? chat.chatIdentifier ?? "";
                return name.toLowerCase().includes(q);
            });
        }

        if (typeof opts.limit === "number") {
            filtered = filtered.slice(0, opts.limit);
        }

        const summaries: ChatSummary[] = filtered.map((chat) => ({
            chatGuid: chat.guid,
            displayName: chat.displayName ?? chat.chatIdentifier ?? null,
            lastMessageAt: null,
            isGroup: this.isGroupChatByChat(chat),
            unreadCount: 0,
            rawChat: chat,
        }));

        // Keep the hook signature compatible with the main SDK: onAfterQuery
        // still receives `Message[]` as its argument.
        await this.pluginManager.callHookForAll("onAfterQuery", []);

        return summaries;
    }

    async startWatching(events?: WatcherEvents): Promise<void> {
        this.ensureNotClosed();

        if (this.watcherStarted) {
            throw new Error("Watcher is already running");
        }

        this.watcherStarted = true;
        this.watcherEvents = events;

        await this.connect();

        this.client.on(NEW_MESSAGE, this.boundHandleNewMessage);
    }

    stopWatching(): void {
        if (!this.watcherStarted) return;
        this.watcherStarted = false;

        this.client.off(NEW_MESSAGE, this.boundHandleNewMessage);
    }

    private async handleNewMessage(message: Message): Promise<void> {
        try {
            if (this.config.watcher.excludeOwnMessages && message.isFromMe) {
                return;
            }

            await this.pluginManager.callHookForAll("onNewMessage", message);

            await this.watcherEvents?.onMessage?.(message);

            const isGroup = this.isGroupChat(message);
            if (isGroup) {
                await this.watcherEvents?.onGroupMessage?.(message);
            } else {
                await this.watcherEvents?.onDirectMessage?.(message);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        void this.pluginManager.callHookForAll("onError", err, "watcher");
        this.watcherEvents?.onError?.(err);
    }

    private isGroupChat(message: Message): boolean {
        if (message.groupTitle) return true;

        const chat = Array.isArray(message.chats) ? (message.chats[0] as Chat | undefined) : undefined;
        if (!chat) return false;

        if (Array.isArray(chat.participants) && chat.participants.length > 2) {
            return true;
        }

        return false;
    }

    private isGroupChatByChat(chat: Chat): boolean {
        if (Array.isArray(chat.participants) && chat.participants.length > 2) {
            return true;
        }

        return false;
    }

    private looksLikeChatGuid(value: string): boolean {
        if (!value) return false;

        if (value.startsWith("chat")) return true;
        if (value.includes(";")) return true;

        return false;
    }

    async replyText(message: Message, text: string): Promise<void> {
        this.ensureNotClosed();
        const chatGuid = this.resolveChatGuid(message);
        if (!chatGuid) {
            throw new Error("Unable to resolve chat GUID for replyText");
        }

        await this.client.messages.sendMessage({
            chatGuid,
            message: text,
            selectedMessageGuid: message.guid,
        });
    }

    async replyImages(message: Message, filePaths: string[]): Promise<void> {
        this.ensureNotClosed();
        const chatGuid = this.resolveChatGuid(message);
        if (!chatGuid) {
            throw new Error("Unable to resolve chat GUID for replyImages");
        }

        for (const filePath of filePaths) {
            await this.client.attachments.sendAttachment({
                chatGuid,
                filePath,
            });
        }
    }

    // ==================== Low-level domain APIs (thin RemoteClient wrappers) ====================

    async sendMessage(options: SendMessageOptions): Promise<Message> {
        return this.client.messages.sendMessage(options);
    }

    async editMessage(options: { messageGuid: string; editedMessage: string; backwardsCompatibilityMessage?: string }): Promise<Message> {
        return this.client.messages.editMessage(options as any);
    }

    async unsendMessage(options: { messageGuid: string }): Promise<Message> {
        return this.client.messages.unsendMessage(options as any);
    }

    async sendReaction(options: { chatGuid: string; messageGuid: string; reaction: string; partIndex?: number }): Promise<void> {
        await this.client.messages.sendReaction(options as any);
    }

    async startTyping(chatGuid: string): Promise<void> {
        await this.client.chats.startTyping(chatGuid);
    }

    async stopTyping(chatGuid: string): Promise<void> {
        await this.client.chats.stopTyping(chatGuid);
    }

    async sendAttachment(options: SendAttachmentOptions): Promise<QueuedAttachmentResult> {
        return this.client.attachments.sendAttachment(options);
    }

    async sendSticker(options: SendStickerOptions): Promise<QueuedAttachmentResult> {
        return this.client.attachments.sendSticker(options);
    }

    async getAttachment(guid: string): Promise<any> {
        return this.client.attachments.getAttachment(guid);
    }

    async getAttachmentCount(): Promise<number> {
        return this.client.attachments.getAttachmentCount();
    }

    async downloadAttachment(
        guid: string,
        options?: {
            original?: boolean;
            force?: boolean;
            height?: number;
            width?: number;
            quality?: number;
        },
    ): Promise<Buffer> {
        return this.client.attachments.downloadAttachment(guid, options);
    }

    async downloadAttachmentLive(guid: string): Promise<Buffer> {
        return this.client.attachments.downloadAttachmentLive(guid);
    }

    async getContacts(): Promise<any[]> {
        return this.client.contacts.getContacts();
    }

    async getContactCard(address: string): Promise<any> {
        return this.client.contacts.getContactCard(address);
    }

    async shareContactCard(chatGuid: string): Promise<void> {
        await this.client.contacts.shareContactCard(chatGuid);
    }

    async shouldShareContact(chatGuid: string): Promise<boolean> {
        return this.client.contacts.shouldShareContact(chatGuid);
    }

    async getHandleCount(): Promise<number> {
        return this.client.handles.getHandleCount();
    }

    async queryHandles(options?: { address?: string; with?: string[]; offset?: number; limit?: number }): Promise<{
        data: any[];
        metadata: { total: number; offset: number; limit: number; count: number };
    }> {
        return this.client.handles.queryHandles(options);
    }

    async getHandle(guid: string): Promise<any> {
        return this.client.handles.getHandle(guid);
    }

    async getHandleAvailability(address: string, type: "imessage" | "facetime"): Promise<boolean> {
        return this.client.handles.getHandleAvailability(address, type);
    }

    async getHandleFocusStatus(guid: string): Promise<string> {
        return this.client.handles.getHandleFocusStatus(guid);
    }

    async getFindMyFriends(): Promise<any[]> {
        return this.client.icloud.getFindMyFriends();
    }

    async refreshFindMyFriends(): Promise<any[]> {
        return this.client.icloud.refreshFindMyFriends();
    }

    async createFaceTimeLink(): Promise<string> {
        return this.client.facetime.createFaceTimeLink();
    }

    async createScheduledMessage(options: CreateScheduledMessageOptions): Promise<ScheduledMessage> {
        return this.client.scheduledMessages.createScheduledMessage(options);
    }

    async getScheduledMessages(): Promise<ScheduledMessage[]> {
        return this.client.scheduledMessages.getScheduledMessages();
    }

    async updateScheduledMessage(
        id: number | string,
        options: UpdateScheduledMessageOptions,
    ): Promise<ScheduledMessage> {
        return this.client.scheduledMessages.updateScheduledMessage(id, options);
    }

    async deleteScheduledMessage(id: number | string): Promise<void> {
        return this.client.scheduledMessages.deleteScheduledMessage(id);
    }

    async getServerInfo(): Promise<any> {
        return this.client.server.getServerInfo();
    }

    async getMessageStats(): Promise<any> {
        return this.client.server.getMessageStats();
    }

    async getServerLogs(count?: number): Promise<string[]> {
        return this.client.server.getServerLogs(count);
    }

    async getAlerts(): Promise<any[]> {
        return this.client.server.getAlerts();
    }

    async markAlertsRead(ids: string[]): Promise<any> {
        return this.client.server.markAlertAsRead(ids);
    }

    async getMediaStatistics(options?: { only?: string[] }): Promise<any> {
        return this.client.server.getMediaStatistics(options);
    }

    async getMediaStatisticsByChat(options?: { only?: string[] }): Promise<any> {
        return this.client.server.getMediaStatisticsByChat(options);
    }

    async getChats(): Promise<Chat[]> {
        return this.client.chats.getChats();
    }

    async getChat(guid: string, options?: { with?: string[] }): Promise<Chat> {
        return this.client.chats.getChat(guid, options);
    }

    async createChat(options: {
        addresses: string[];
        message?: string;
        service?: "iMessage" | "SMS";
        tempGuid?: string;
        subject?: string;
        effectId?: string;
        attributedBody?: Record<string, unknown>;
    }): Promise<Chat> {
        return this.client.chats.createChat(options);
    }

    async updateChat(guid: string, options: { displayName?: string }): Promise<Chat> {
        return this.client.chats.updateChat(guid, options);
    }

    async deleteChat(guid: string): Promise<void> {
        return this.client.chats.deleteChat(guid);
    }

    async markChatRead(guid: string): Promise<void> {
        return this.client.chats.markChatRead(guid);
    }

    async markChatUnread(guid: string): Promise<void> {
        return this.client.chats.markChatUnread(guid);
    }

    async leaveChat(guid: string): Promise<void> {
        return this.client.chats.leaveChat(guid);
    }

    async addParticipant(chatGuid: string, address: string): Promise<Chat> {
        return this.client.chats.addParticipant(chatGuid, address);
    }

    async removeParticipant(chatGuid: string, address: string): Promise<Chat> {
        return this.client.chats.removeParticipant(chatGuid, address);
    }

    async getChatMessages(
        chatGuid: string,
        options?: {
            offset?: number;
            limit?: number;
            sort?: "ASC" | "DESC";
            before?: number | Date;
            after?: number | Date;
            withChats?: boolean;
            withAttachments?: boolean;
            withChatParticipants?: boolean;
            where?: unknown;
            with?: string[];
        },
    ): Promise<Message[]> {
        return this.client.chats.getChatMessages(chatGuid, options as any);
    }

    async setGroupIcon(chatGuid: string, filePath: string): Promise<void> {
        return this.client.chats.setGroupIcon(chatGuid, filePath);
    }

    async removeGroupIcon(chatGuid: string): Promise<void> {
        return this.client.chats.removeGroupIcon(chatGuid);
    }

    async getGroupIcon(chatGuid: string): Promise<Buffer> {
        return this.client.chats.getGroupIcon(chatGuid);
    }

    /**
     * Clear processed message records on the underlying RemoteClient.
     * This helps prevent unbounded growth of the processed message cache.
     */
    clearProcessedMessages(maxSize: number = 1000): void {
        this.ensureNotClosed();
        this.client.clearProcessedMessages(maxSize);
    }

    getProcessedMessageCount(): number {
        this.ensureNotClosed();
        return this.client.getProcessedMessageCount();
    }

    private resolveChatGuid(message: Message): string | null {
        const chat = Array.isArray(message.chats) ? (message.chats[0] as Chat | undefined) : undefined;
        return chat?.guid ?? null;
    }

    /**
     * Gracefully shut down this SDK instance.
     *
     * - Stops the watcher (if running)
     * - Destroys all plugins
     * - Disconnects the underlying RemoteClient
     *
     * Once closed, the instance must not be used again.
     */
    async close(): Promise<void> {
        if (this.closed) {
            return;
        }

        this.closed = true;

        const errors: Array<{ component: string; error: Error }> = [];

        try {
            this.stopWatching();
        } catch (error) {
            errors.push({
                component: "watcher",
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }

        try {
            await this.pluginManager.destroy();
        } catch (error) {
            errors.push({
                component: "pluginManager",
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }

        try {
            await this.client.disconnect();
        } catch (error) {
            errors.push({
                component: "client",
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }

        if (errors.length > 0) {
            throw errors[0]!.error;
        }
    }
}

/**
 * Fluent helper for processing a single message.
 *
 * Example:
 * sdk.message(msg)
 *   .ifFromOthers()
 *   .matchText(/hello/i)
 *   .replyText("Hi!")
 *   .execute();
 */
export class MessageChain {
    private shouldExecute = true;
    private actions: Array<() => Promise<void>> = [];
    private executed = false;

    constructor(
        private readonly message: Message,
        private readonly sdk: IMessageSDK,
    ) {
        if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
            setTimeout(() => {
                if (!this.executed && this.actions.length > 0) {
                    // eslint-disable-next-line no-console
                    console.warn(
                        "[MessageChain] Warning: Unexecuted message chain detected.",
                        "You need to explicitly call .execute() method.",
                    );
                }
            }, 1000);
        }
    }

    when(predicate: (message: Message) => boolean): this {
        if (this.shouldExecute) {
            this.shouldExecute = predicate(this.message);
        }
        return this;
    }

    matchText(pattern: string | RegExp): this {
        return this.when((m) => {
            if (!m.text) return false;
            return typeof pattern === "string" ? m.text.includes(pattern) : pattern.test(m.text);
        });
    }

    ifUnread(): this {
        return this.when((m) => !m.dateRead);
    }

    ifFromOthers(): this {
        return this.when((m) => !m.isFromMe);
    }

    ifFromMe(): this {
        return this.when((m) => m.isFromMe);
    }

    replyText(text: string | ((m: Message) => string)): this {
        if (this.shouldExecute) {
            this.actions.push(async () => {
                const replyText = typeof text === "function" ? text(this.message) : text;
                await this.sdk.replyText(this.message, replyText);
            });
        }
        return this;
    }

    replyImage(images: string | string[] | ((m: Message) => string | string[])): this {
        if (this.shouldExecute) {
            this.actions.push(async () => {
                const imagePaths = typeof images === "function" ? images(this.message) : images;
                const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
                await this.sdk.replyImages(this.message, paths);
            });
        }
        return this;
    }

    do(handler: (message: Message) => void | Promise<void>): this {
        if (this.shouldExecute) {
            this.actions.push(async () => {
                await Promise.resolve(handler(this.message));
            });
        }
        return this;
    }

    async execute(): Promise<void> {
        this.executed = true;

        if (!this.shouldExecute || this.actions.length === 0) {
            return;
        }

        for (const action of this.actions) {
            await action();
        }
    }
}
