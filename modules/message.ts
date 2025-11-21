import { randomUUID } from "node:crypto";
import type { AdvancedIMessageKit } from "../mobai";
import type { Message } from "../interfaces";
import type { SendMessageOptions, ValidRemoveTapback, ValidTapback } from "../types";
import type { SocketEventMap } from "../types";

export class MessageModule {
    constructor(private readonly sdk: AdvancedIMessageKit) {}

    async sendMessage(options: SendMessageOptions): Promise<Message> {
        const tempGuid = options.tempGuid ?? randomUUID();
        const payload: SocketEventMap["send-message"]["req"] = {
            guid: options.chatGuid,
            message: options.message,
            tempGuid,
        };
        return this.sdk.request("send-message", payload);
    }

    async getMessage(guid: string, options?: SocketEventMap["get-message"]["req"]["with"] extends
        (infer T)[] ? { with?: T[] } : { with?: string[] }): Promise<Message> {
        return this.sdk.request("get-message", {
            guid,
            ...(options ?? {}),
        });
    }

    async getMessages(options: SocketEventMap["get-messages"]["req"]): Promise<Message[]> {
        return this.sdk.request("get-messages", options);
    }

    async getMessageCount(options?: SocketEventMap["get-message-count"]["req"]): Promise<number> {
        const res = await this.sdk.request("get-message-count", options);
        return res.total;
    }

    async getUpdatedMessageCount(options?: SocketEventMap["get-updated-message-count"]["req"]): Promise<number> {
        const res = await this.sdk.request("get-updated-message-count", options);
        return res.total;
    }

    async getSentMessageCount(options?: SocketEventMap["get-sent-message-count"]["req"]): Promise<number> {
        const res = await this.sdk.request("get-sent-message-count", options);
        return res.total;
    }

    async editMessage(options: {
        messageGuid: string;
        editedMessage: string;
        backwardsCompatibilityMessage?: string;
        partIndex?: number;
    }): Promise<Message> {
        const chatGuid = await this.resolveChatGuidFromMessage(options.messageGuid);
        if (!chatGuid) {
            throw new Error("Unable to resolve chat GUID for message when editing.");
        }

        const payload: SocketEventMap["edit-message"]["req"] = {
            chatGuid,
            messageGuid: options.messageGuid,
            editedMessage: options.editedMessage,
            backwardsCompatMessage: options.backwardsCompatibilityMessage || options.editedMessage,
            partIndex: options.partIndex ?? 0,
        };

        return this.sdk.request("edit-message", payload);
    }

    async sendReaction(options: {
        chatGuid: string;
        messageGuid: string;
        reaction: ValidTapback | ValidRemoveTapback;
        partIndex?: number;
    }): Promise<Message> {
        const tempGuid = randomUUID();
        const payload: SocketEventMap["send-reaction"]["req"] = {
            chatGuid: options.chatGuid,
            tempGuid,
            messageGuid: options.messageGuid,
            messageText: options.reaction,
            actionMessageGuid: options.messageGuid,
            actionMessageText: options.reaction,
            tapback: options.reaction,
            partIndex: options.partIndex ?? 0,
        };
        return this.sdk.request("send-reaction", payload);
    }

    private async resolveChatGuidFromMessage(messageGuid: string): Promise<string | null> {
        const msg = await this.getMessage(messageGuid, { with: ["chats"] });
        const chat = Array.isArray(msg?.chats) ? msg.chats.find((c) => Boolean(c?.guid)) : undefined;
        return chat?.guid ?? null;
    }

    async unsendMessage(options: { messageGuid: string; chatGuid?: string; partIndex?: number }): Promise<Message> {
        const chatGuid = options.chatGuid ?? (await this.resolveChatGuidFromMessage(options.messageGuid));
        if (!chatGuid) {
            throw new Error("Unable to resolve chat GUID for message when unsending.");
        }

        const payload: SocketEventMap["unsend-message"]["req"] = {
            chatGuid,
            messageGuid: options.messageGuid,
            partIndex: options.partIndex ?? 0,
        };
        return this.sdk.request("unsend-message", payload);
    }

    async notifyMessage(guid: string): Promise<void> {
        // Socket route requires both chatGuid and messageGuid, so resolve chatGuid from the message first.
        const chatGuid = await this.resolveChatGuidFromMessage(guid);
        if (!chatGuid) return;

        const payload: SocketEventMap["notify-message"]["req"] = {
            chatGuid,
            messageGuid: guid,
        };
        await this.sdk.request("notify-message", payload);
    }

    async getEmbeddedMedia(guid: string): Promise<string | null> {
        // Same issue as notifyMessage, socket route needs chatGuid
        const chatGuid = await this.resolveChatGuidFromMessage(guid);
        if (!chatGuid) return null;

        const payload: SocketEventMap["get-embedded-media"]["req"] = {
            chatGuid,
            messageGuid: guid,
        };
        return this.sdk.request("get-embedded-media", payload);
    }
}
