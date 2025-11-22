import { readFile } from "node:fs/promises";
import type { RemoteClient } from "../remoteClient";
import type { Chat, Message } from "../interfaces";
import * as base64 from "byte-base64";
import type { SocketEventMap } from "../types";

export class ChatModule {
    constructor(private readonly sdk: RemoteClient) {}

    async getChats(): Promise<Chat[]> {
        return this.sdk.request("get-chats");
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
        if (!options.addresses || options.addresses.length === 0) {
            throw new Error("addresses must contain at least one recipient");
        }

        const payload: SocketEventMap["start-chat"]["req"] = {
            participants: options.addresses,
            message: options.message,
            service: options.service,
            tempGuid: options.tempGuid,
        };

        return this.sdk.request("start-chat", payload);
    }

    async getChat(guid: string, options?: { with?: string[] }): Promise<Chat> {
        const payload: SocketEventMap["get-chat"]["req"] = {
            chatGuid: guid,
            ...(options ?? {}),
        };
        return this.sdk.request("get-chat", payload);
    }

    async updateChat(guid: string, options: { displayName?: string }): Promise<Chat> {
        // Only displayName rename is supported via the rename-group socket route.
        if (options.displayName) {
            const payload: SocketEventMap["rename-group"]["req"] = {
                identifier: guid,
                newName: options.displayName,
            };
            return this.sdk.request("rename-group", payload);
        }
        throw new Error("Only displayName update supported via socket currently");
    }

    async deleteChat(guid: string): Promise<void> {
        return this.sdk.request("delete-chat", { chatGuid: guid });
    }

    async markChatRead(guid: string): Promise<void> {
        return this.sdk.request("mark-chat-read", { chatGuid: guid });
    }

    async markChatUnread(guid: string): Promise<void> {
        return this.sdk.request("mark-chat-unread", { chatGuid: guid });
    }

    async leaveChat(guid: string): Promise<void> {
        return this.sdk.request("leave-chat", { chatGuid: guid });
    }

    async addParticipant(chatGuid: string, address: string): Promise<Chat> {
        const payload: SocketEventMap["add-participant"]["req"] = {
            identifier: chatGuid,
            address,
        };
        return this.sdk.request("add-participant", payload);
    }

    async removeParticipant(chatGuid: string, address: string): Promise<Chat> {
        const payload: SocketEventMap["remove-participant"]["req"] = {
            identifier: chatGuid,
            address,
        };
        return this.sdk.request("remove-participant", payload);
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
        const payload: SocketEventMap["get-chat-messages"]["req"] = {
            identifier: chatGuid,
            offset: options?.offset,
            limit: options?.limit,
            after: options?.after,
            before: options?.before,
            withChats: options?.withChats,
            withChatParticipants: options?.withChatParticipants,
            withAttachments: options?.withAttachments,
            sort: options?.sort,
            where: options?.where,
        };

        return this.sdk.request("get-chat-messages", payload);
    }

    async setGroupIcon(chatGuid: string, filePath: string): Promise<void> {
        const fileBuffer = await readFile(filePath);
        // Send base64-encoded icon data to the set-group-icon socket route.
        const payload: SocketEventMap["set-group-icon"]["req"] = {
            chatGuid,
            iconData: base64.bytesToBase64(fileBuffer),
        };
        return this.sdk.request("set-group-icon", payload);
    }

    async removeGroupIcon(chatGuid: string): Promise<void> {
        return this.sdk.request("remove-group-icon", { chatGuid });
    }

    async getGroupIcon(chatGuid: string): Promise<Buffer> {
        const res = await this.sdk.request<SocketEventMap["get-group-icon"]["res"]>("get-group-icon", { chatGuid });
        return Buffer.from(res, "base64");
    }

    async getChatCount(options?: { includeArchived?: boolean }): Promise<{
        total: number;
        breakdown: Record<string, number>;
    }> {
        return this.sdk.request("get-chat-count", options);
    }

    async startTyping(chatGuid: string): Promise<void> {
        return this.sdk.request("started-typing", { chatGuid });
    }

    async stopTyping(chatGuid: string): Promise<void> {
        return this.sdk.request("stopped-typing", { chatGuid });
    }
}
