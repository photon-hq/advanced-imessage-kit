import type { AxiosInstance } from "axios";

export class ContactModule {
    constructor(private readonly http: AxiosInstance) {}

    async getContacts(): Promise<any[]> {
        const response = await this.http.get("/api/v1/contact");
        return response.data.data;
    }
}
