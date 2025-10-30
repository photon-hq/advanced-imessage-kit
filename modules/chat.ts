import type { AxiosInstance } from "axios";
import type { Chat } from "../interfaces/message";

export class ChatModule {
    constructor(private readonly http: AxiosInstance) {}

    async getChats(): Promise<Chat[]> {
        const response = await this.http.post("/api/v1/chat/query", {});
        return response.data.data;
    }

    async shareContactCard(chatGuid: string): Promise<void> {
        await this.http.post(`/api/v1/chat/${chatGuid}/share/contact`);
    }

    async startTyping(chatGuid: string): Promise<void> {
        await this.http.post(`/api/v1/chat/${chatGuid}/typing`);
    }

    async stopTyping(chatGuid: string): Promise<void> {
        await this.http.delete(`/api/v1/chat/${chatGuid}/typing`);
    }
}
