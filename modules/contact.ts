import type { AxiosInstance } from "axios";

export class ContactModule {
    constructor(private readonly http: AxiosInstance) {}

    async getContacts(): Promise<any[]> {
        const response = await this.http.get("/api/v1/contact");
        return response.data.data;
    }

    async getContactCard(address: string): Promise<any> {
        const response = await this.http.get("/api/v1/icloud/contact", {
            params: { address },
        });
        return response.data.data;
    }

    async shareContactCard(chatGuid: string): Promise<void> {
        await this.http.post(`/api/v1/chat/${encodeURIComponent(chatGuid)}/share/contact`);
    }

    async shouldShareContact(chatGuid: string): Promise<boolean> {
        const response = await this.http.get(`/api/v1/chat/${encodeURIComponent(chatGuid)}/share/contact/status`);
        return response.data.data;
    }
}
