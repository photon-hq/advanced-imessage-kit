import { randomUUID } from "node:crypto";
import type { AxiosInstance } from "axios";
import type { Message } from "../interfaces/message";
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

    async getMessages(options: any): Promise<Message[]> {
        const response = await this.http.post("/api/v1/message/query", options);
        return response.data.data;
    }

    async unsendMessage(options: { messageGuid: string; partIndex?: number }): Promise<Message> {
        const response = await this.http.post(`/api/v1/message/${options.messageGuid}/unsend`, {
            partIndex: options.partIndex ?? 0,
        });
        return response.data.data;
    }
}
