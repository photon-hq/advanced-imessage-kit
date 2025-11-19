import { randomUUID } from "node:crypto";
import type { AdvancedIMessageKit } from "../mobai";
import type { Message } from "../interfaces";
import type { SendMessageOptions } from "../types";

export class MessageModule {
    constructor(private readonly sdk: AdvancedIMessageKit) {}

    async sendMessage(options: SendMessageOptions): Promise<Message> {
        const payload = {
            ...options,
            tempGuid: options.tempGuid || randomUUID(),
        };
        return this.sdk.request("send-message", payload);
    }

    async getMessage(guid: string, options?: { with?: string[] }): Promise<Message> {
        return this.sdk.request("get-message", {
            guid,
            ...options
        });
    }

    async getMessages(options: any): Promise<Message[]> {
        return this.sdk.request("get-messages", options);
    }

    async getMessageCount(options?: {
        after?: number;
        before?: number;
        chatGuid?: string;
        minRowId?: number;
        maxRowId?: number;
    }): Promise<number> {
        const res = await this.sdk.request("get-message-count", options);
        return res.total;
    }

    async getUpdatedMessageCount(options?: {
        after?: number;
        before?: number;
        chatGuid?: string;
        minRowId?: number;
        maxRowId?: number;
    }): Promise<number> {
        const res = await this.sdk.request("get-updated-message-count", options);
        return res.total;
    }

    async getSentMessageCount(options?: {
        after?: number;
        before?: number;
        chatGuid?: string;
        minRowId?: number;
        maxRowId?: number;
    }): Promise<number> {
        const res = await this.sdk.request("get-sent-message-count", options);
        return res.total;
    }

    async editMessage(options: {
        messageGuid: string;
        editedMessage: string;
        backwardsCompatibilityMessage?: string;
        partIndex?: number;
    }): Promise<Message> {
        return this.sdk.request("edit-message", {
            messageGuid: options.messageGuid,
            editedMessage: options.editedMessage,
            backwardsCompatibilityMessage: options.backwardsCompatibilityMessage || options.editedMessage,
            partIndex: options.partIndex ?? 0,
        });
    }

    async sendReaction(options: {
        chatGuid: string;
        messageGuid: string;
        reaction: string;
        partIndex?: number;
    }): Promise<Message> {
        const tempGuid = randomUUID();
        return this.sdk.request("send-reaction", {
            chatGuid: options.chatGuid,
            tempGuid,
            messageGuid: options.messageGuid,
            messageText: options.reaction,
            actionMessageGuid: options.messageGuid,
            actionMessageText: options.reaction,
            tapback: options.reaction,
            partIndex: options.partIndex ?? 0,
        });
    }

    async unsendMessage(options: { messageGuid: string; partIndex?: number }): Promise<Message> {
        return this.sdk.request("unsend-message", {
            messageGuid: options.messageGuid,
            partIndex: options.partIndex ?? 0,
        });
    }

    async notifyMessage(guid: string): Promise<void> {
        // Socket route requires both chatGuid and messageGuid, so resolve chatGuid from the message first.
        const msg = await this.getMessage(guid);
        if (msg && msg.chats && msg.chats.length > 0 && msg.chats[0]) {
             await this.sdk.request("notify-message", {
                chatGuid: msg.chats[0].guid,
                messageGuid: guid
            });
        }
    }

    async getEmbeddedMedia(guid: string): Promise<any> {
        // Same issue as notifyMessage, socket route needs chatGuid
        const msg = await this.getMessage(guid);
        if (msg && msg.chats && msg.chats.length > 0 && msg.chats[0]) {
            return this.sdk.request("get-embedded-media", {
                chatGuid: msg.chats[0].guid,
                messageGuid: guid
            });
        }
        return null;
    }
}
