import { randomUUID } from "node:crypto";
import type { AxiosInstance } from "axios";
import type { Message } from "../interfaces";
import type { SendMessageOptions } from "../types";

export class MessageModule {
    constructor(private readonly http: AxiosInstance) {}

    async sendMessage(options: SendMessageOptions): Promise<Message> {
        const payload = {
            ...options,
            tempGuid: options.tempGuid || randomUUID(),
        };
        const response = await this.http.post("/api/v1/message/text", payload);
        return response.data.data;
    }

    async getMessage(guid: string, options?: { with?: string[] }): Promise<Message> {
        const response = await this.http.get(`/api/v1/message/${guid}`, {
            params: options?.with ? { with: options.with.join(",") } : {},
        });
        return response.data.data;
    }

    async getMessages(options: any): Promise<Message[]> {
        const response = await this.http.post("/api/v1/message/query", options);
        return response.data.data;
    }

    async getMessageCount(options?: {
        after?: number;
        before?: number;
        chatGuid?: string;
        minRowId?: number;
        maxRowId?: number;
    }): Promise<number> {
        const params: Record<string, any> = {};
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
        const params: Record<string, any> = {};
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
        const params: Record<string, any> = {};
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
    }): Promise<Message> {
        const response = await this.http.post(`/api/v1/message/${options.messageGuid}/edit`, {
            editedMessage: options.editedMessage,
            backwardsCompatibilityMessage: options.backwardsCompatibilityMessage || options.editedMessage,
            partIndex: options.partIndex ?? 0,
        });
        return response.data.data;
    }

    async sendReaction(options: {
        chatGuid: string;
        messageGuid: string;
        reaction: string;
        partIndex?: number;
    }): Promise<Message> {
        const response = await this.http.post("/api/v1/message/react", {
            chatGuid: options.chatGuid,
            selectedMessageGuid: options.messageGuid,
            reaction: options.reaction,
            partIndex: options.partIndex ?? 0,
        });
        return response.data.data;
    }

    async unsendMessage(options: { messageGuid: string; partIndex?: number }): Promise<Message> {
        const response = await this.http.post(`/api/v1/message/${options.messageGuid}/unsend`, {
            partIndex: options.partIndex ?? 0,
        });
        return response.data.data;
    }

    async notifyMessage(guid: string): Promise<void> {
        await this.http.post(`/api/v1/message/${guid}/notify`);
    }

    async getEmbeddedMedia(guid: string): Promise<any> {
        const response = await this.http.get(`/api/v1/message/${guid}/embedded-media`);
        return response.data.data;
    }
}
