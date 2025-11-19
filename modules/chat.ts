import { readFile } from "node:fs/promises";
import type { AdvancedIMessageKit } from "../mobai";
import type { Chat, Message } from "../interfaces";
import * as base64 from "byte-base64";

export class ChatModule {
    constructor(private readonly sdk: AdvancedIMessageKit) {}

    async getChats(): Promise<Chat[]> {
        return this.sdk.request("get-chats");
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
    }): Promise<Chat> {
        return this.sdk.request("start-chat", {
            participants: options.addresses,
            message: options.message,
            service: options.service,
            tempGuid: options.tempGuid
        });
    }

    async getChat(guid: string, options?: { with?: string[] }): Promise<Chat> {
        return this.sdk.request("get-chat", {
            chatGuid: guid,
            ...options
        });
    }

    async updateChat(guid: string, options: { displayName?: string }): Promise<Chat> {
        // Only displayName rename is supported via the rename-group socket route.
        if (options.displayName) {
             return this.sdk.request("rename-group", {
                identifier: guid,
                newName: options.displayName
            });
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
        return this.sdk.request("add-participant", {
            identifier: chatGuid,
            address
        });
    }

    async removeParticipant(chatGuid: string, address: string): Promise<Chat> {
        return this.sdk.request("remove-participant", {
            identifier: chatGuid,
            address
        });
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
    ): Promise<Message[]> {
        return this.sdk.request("get-chat-messages", {
            identifier: chatGuid,
            ...options
        });
    }

    async setGroupIcon(chatGuid: string, filePath: string): Promise<void> {
        const fileBuffer = await readFile(filePath);
        // Send base64-encoded icon data to the set-group-icon socket route.
        return this.sdk.request("set-group-icon", {
            chatGuid,
            iconData: base64.bytesToBase64(fileBuffer)
        });
    }

    async removeGroupIcon(chatGuid: string): Promise<void> {
        return this.sdk.request("remove-group-icon", { chatGuid });
    }

    async getGroupIcon(chatGuid: string): Promise<Buffer> {
        const res = await this.sdk.request("get-group-icon", { chatGuid });
        // res should be base64 string
        return Buffer.from(res, 'base64');
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
