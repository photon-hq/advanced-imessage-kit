import { randomUUID } from "node:crypto";
import type { AxiosInstance } from "axios";
import { createChatWithMessage, extractAddress, isChatNotExistError } from "../lib/auto-create-chat";
import type { MessageResponse, SendMessageOptions } from "../types";

export class MessageModule {
    constructor(
        private readonly http: AxiosInstance,
        private readonly enqueueSend: <T>(task: () => Promise<T>) => Promise<T> = (task) => task(),
    ) {}

    async sendMessage(options: SendMessageOptions): Promise<MessageResponse> {
        return this.enqueueSend(async () => {
            const tempGuid = options.tempGuid || randomUUID();
            const payload = { ...options, tempGuid };

            try {
                const response = await this.http.post("/api/v1/message/text", payload);
                return response.data.data;
            } catch (error: unknown) {
                if (!isChatNotExistError(error)) throw error;

                const address = extractAddress(options.chatGuid);
                if (!address) throw error;

                await createChatWithMessage({
                    http: this.http,
                    address,
                    message: options.message,
                    tempGuid,
                    subject: options.subject,
                    effectId: options.effectId,
                });
                return { guid: tempGuid, text: options.message, dateCreated: Date.now() } as MessageResponse;
            }
        });
    }

    async getMessage(guid: string, options?: { with?: string[] }): Promise<MessageResponse> {
        const response = await this.http.get(`/api/v1/message/${encodeURIComponent(guid)}`, {
            params: options?.with ? { with: options.with.join(",") } : {},
        });
        return response.data.data;
    }

    async getMessages(options?: {
        chatGuid?: string;
        offset?: number;
        limit?: number;
        sort?: "ASC" | "DESC";
        before?: number;
        after?: number;
        with?: string[];
    }): Promise<MessageResponse[]> {
        const response = await this.http.post("/api/v1/message/query", options ?? {});
        return response.data.data;
    }

    async getMessageCount(options?: {
        after?: number;
        before?: number;
        chatGuid?: string;
        minRowId?: number;
        maxRowId?: number;
    }): Promise<number> {
        const params: Record<string, unknown> = {};
        if (options?.after !== undefined) params.after = options.after;
        if (options?.before !== undefined) params.before = options.before;
        if (options?.chatGuid) params.chatGuid = options.chatGuid;
        if (options?.minRowId !== undefined) params.minRowId = options.minRowId;
        if (options?.maxRowId !== undefined) params.maxRowId = options.maxRowId;

        const response = await this.http.get("/api/v1/message/count", { params });
        return response.data.data.total;
    }

    async getUpdatedMessageCount(options?: {
        after?: number;
        before?: number;
        chatGuid?: string;
        minRowId?: number;
        maxRowId?: number;
    }): Promise<number> {
        const params: Record<string, unknown> = {};
        if (options?.after !== undefined) params.after = options.after;
        if (options?.before !== undefined) params.before = options.before;
        if (options?.chatGuid) params.chatGuid = options.chatGuid;
        if (options?.minRowId !== undefined) params.minRowId = options.minRowId;
        if (options?.maxRowId !== undefined) params.maxRowId = options.maxRowId;

        const response = await this.http.get("/api/v1/message/count/updated", {
            params,
        });
        return response.data.data.total;
    }

    async getSentMessageCount(options?: {
        after?: number;
        before?: number;
        chatGuid?: string;
        minRowId?: number;
        maxRowId?: number;
    }): Promise<number> {
        const params: Record<string, unknown> = {};
        if (options?.after !== undefined) params.after = options.after;
        if (options?.before !== undefined) params.before = options.before;
        if (options?.chatGuid) params.chatGuid = options.chatGuid;
        if (options?.minRowId !== undefined) params.minRowId = options.minRowId;
        if (options?.maxRowId !== undefined) params.maxRowId = options.maxRowId;

        const response = await this.http.get("/api/v1/message/count/me", {
            params,
        });
        return response.data.data.total;
    }

    async editMessage(options: {
        messageGuid: string;
        editedMessage: string;
        backwardsCompatibilityMessage?: string;
        partIndex?: number;
    }): Promise<MessageResponse> {
        return this.enqueueSend(async () => {
            const response = await this.http.post(`/api/v1/message/${encodeURIComponent(options.messageGuid)}/edit`, {
                editedMessage: options.editedMessage,
                backwardsCompatibilityMessage: options.backwardsCompatibilityMessage || options.editedMessage,
                partIndex: options.partIndex ?? 0,
            });
            return response.data.data;
        });
    }

    async sendReaction(options: {
        chatGuid: string;
        messageGuid: string;
        reaction: string;
        partIndex?: number;
    }): Promise<MessageResponse> {
        return this.enqueueSend(async () => {
            const response = await this.http.post("/api/v1/message/react", {
                chatGuid: options.chatGuid,
                selectedMessageGuid: options.messageGuid,
                reaction: options.reaction,
                partIndex: options.partIndex ?? 0,
            });
            return response.data.data;
        });
    }

    async unsendMessage(options: { messageGuid: string; partIndex?: number }): Promise<MessageResponse> {
        return this.enqueueSend(async () => {
            const response = await this.http.post(`/api/v1/message/${encodeURIComponent(options.messageGuid)}/unsend`, {
                partIndex: options.partIndex ?? 0,
            });
            return response.data.data;
        });
    }

    async notifyMessage(guid: string): Promise<void> {
        await this.http.post(`/api/v1/message/${encodeURIComponent(guid)}/notify`);
    }

    async getEmbeddedMedia(guid: string): Promise<{
        path?: string;
        data?: string;
    }> {
        const response = await this.http.get(`/api/v1/message/${encodeURIComponent(guid)}/embedded-media`);
        return response.data.data;
    }

    async searchMessages(options: {
        query: string;
        chatGuid?: string;
        offset?: number;
        limit?: number;
        sort?: "ASC" | "DESC";
        before?: number;
        after?: number;
    }): Promise<MessageResponse[]> {
        // Use MessageRouter.query (POST /api/v1/message/query) and a message.text LIKE condition to perform server-side text search
        const { query, chatGuid, offset, limit, sort, before, after } = options;

        // Validate: empty query would match all messages
        if (!query || query.trim().length === 0) {
            throw new Error("Search query cannot be empty");
        }

        // Note: We don't escape % and _ here because:
        // 1. Server uses Spotlight API (on macOS 13+) which is token-based, not substring-based.
        //    - Matches "Hello" -> "Hello world" (Word match)
        //    - No match "Hell" -> "Hello" (Partial word mismatch)
        //    - Matches "测试" -> "这是一个测试" (Chinese token match)
        // 2. Spotlight doesn't understand SQL ESCAPE syntax.
        // 3. Parameterized queries already prevent SQL injection.
        const where = [
            {
                statement: "message.text LIKE :text",
                args: { text: `%${query}%` },
            },
        ];

        const payload: Record<string, unknown> = {
            where,
        };

        if (chatGuid) payload.chatGuid = chatGuid;
        if (offset !== undefined) payload.offset = offset;
        if (limit !== undefined) payload.limit = limit;
        if (sort) payload.sort = sort;
        if (before !== undefined) payload.before = before;
        if (after !== undefined) payload.after = after;

        const response = await this.http.post("/api/v1/message/query", payload);
        return response.data.data;
    }
}
