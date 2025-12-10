import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AxiosInstance } from "axios";
import FormData from "form-data";
import type { ChatResponse, MessageResponse } from "../types";

export class ChatModule {
    constructor(private readonly http: AxiosInstance) {}

    async getChats(options?: {
        withLastMessage?: boolean;
        withArchived?: boolean;
        offset?: number;
        limit?: number;
        sort?: string;
    }): Promise<ChatResponse[]> {
        const response = await this.http.post("/api/v1/chat/query", options ?? {});
        return response.data.data;
    }

    async createChat(options: {
        addresses: string[];
        message?: string;
        method?: "apple-script" | "private-api";
        service?: "iMessage" | "SMS";
        tempGuid?: string;
        subject?: string;
        effectId?: string;
        attributedBody?: Record<string, unknown>;
    }): Promise<ChatResponse> {
        const response = await this.http.post("/api/v1/chat/new", options);
        return response.data.data;
    }

    async getChat(guid: string, options?: { with?: string[] }): Promise<ChatResponse> {
        const response = await this.http.get(`/api/v1/chat/${encodeURIComponent(guid)}`, {
            params: options?.with ? { with: options.with.join(",") } : {},
        });
        return response.data.data;
    }

    async updateChat(guid: string, options: { displayName?: string }): Promise<ChatResponse> {
        const response = await this.http.put(`/api/v1/chat/${encodeURIComponent(guid)}`, options);
        return response.data.data;
    }

    async deleteChat(guid: string): Promise<void> {
        await this.http.delete(`/api/v1/chat/${encodeURIComponent(guid)}`);
    }

    async markChatRead(guid: string): Promise<void> {
        await this.http.post(`/api/v1/chat/${encodeURIComponent(guid)}/read`);
    }

    async markChatUnread(guid: string): Promise<void> {
        await this.http.post(`/api/v1/chat/${encodeURIComponent(guid)}/unread`);
    }

    async leaveChat(guid: string): Promise<void> {
        await this.http.post(`/api/v1/chat/${encodeURIComponent(guid)}/leave`);
    }

    async addParticipant(chatGuid: string, address: string): Promise<ChatResponse> {
        const response = await this.http.post(`/api/v1/chat/${encodeURIComponent(chatGuid)}/participant`, {
            address,
        });
        return response.data.data;
    }

    async removeParticipant(chatGuid: string, address: string): Promise<ChatResponse> {
        const response = await this.http.delete(`/api/v1/chat/${encodeURIComponent(chatGuid)}/participant`, {
            data: { address },
        });
        return response.data.data;
    }

    async getChatMessages(
        chatGuid: string,
        options?: {
            offset?: number;
            limit?: number;
            sort?: "ASC" | "DESC";
            before?: number;
            after?: number;
            with?: string[];
        },
    ): Promise<MessageResponse[]> {
        const params: Record<string, unknown> = {};
        if (options?.offset !== undefined) params.offset = options.offset;
        if (options?.limit !== undefined) params.limit = options.limit;
        if (options?.sort) params.sort = options.sort;
        if (options?.before !== undefined) params.before = options.before;
        if (options?.after !== undefined) params.after = options.after;
        if (options?.with) params.with = options.with.join(",");

        const response = await this.http.get(`/api/v1/chat/${encodeURIComponent(chatGuid)}/message`, {
            params,
        });
        return response.data.data;
    }

    async setGroupIcon(chatGuid: string, filePath: string): Promise<void> {
        const fileBuffer = await readFile(filePath);
        const fileName = path.basename(filePath);
        const form = new FormData();
        form.append("icon", fileBuffer, fileName);

        await this.http.post(`/api/v1/chat/${encodeURIComponent(chatGuid)}/icon`, form, {
            headers: form.getHeaders(),
        });
    }

    async removeGroupIcon(chatGuid: string): Promise<void> {
        await this.http.delete(`/api/v1/chat/${encodeURIComponent(chatGuid)}/icon`);
    }

    async getGroupIcon(chatGuid: string): Promise<Buffer> {
        const response = await this.http.get(`/api/v1/chat/${encodeURIComponent(chatGuid)}/icon`, {
            responseType: "arraybuffer",
        });
        return Buffer.from(response.data);
    }

    async getChatCount(options?: { includeArchived?: boolean }): Promise<{
        total: number;
        breakdown: Record<string, number>;
    }> {
        const response = await this.http.get("/api/v1/chat/count", {
            params: options?.includeArchived !== undefined ? { includeArchived: options.includeArchived } : {},
        });
        return response.data.data;
    }

    async startTyping(chatGuid: string): Promise<void> {
        await this.http.post(`/api/v1/chat/${encodeURIComponent(chatGuid)}/typing`);
    }

    async stopTyping(chatGuid: string): Promise<void> {
        await this.http.delete(`/api/v1/chat/${encodeURIComponent(chatGuid)}/typing`);
    }

    async getBackground(chatGuid: string): Promise<{
        hasBackground: boolean;
        backgroundChannelGUID?: string | null;
        imageUrl?: string | null;
        backgroundId?: string | null;
    }> {
        const response = await this.http.get(`/api/v1/chat/${encodeURIComponent(chatGuid)}/background`);
        return response.data.data;
    }

    async setBackground(
        chatGuid: string,
        options: string | { imageUrl?: string; filePath?: string; fileData?: string },
    ): Promise<void> {
        const body = typeof options === "string" ? { imageUrl: options } : options;
        await this.http.post(`/api/v1/chat/${encodeURIComponent(chatGuid)}/background`, body);
    }

    async removeBackground(chatGuid: string): Promise<void> {
        await this.http.delete(`/api/v1/chat/${encodeURIComponent(chatGuid)}/background`);
    }
}
