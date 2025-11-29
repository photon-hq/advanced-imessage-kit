import type { AxiosInstance } from "axios";

export class ScheduledMessageModule {
    constructor(private readonly http: AxiosInstance) {}

    async createScheduledMessage(options: any): Promise<any> {
        const response = await this.http.post("/api/v1/message/schedule", options);
        return response.data.data;
    }

    async getScheduledMessages(): Promise<any[]> {
        const response = await this.http.get("/api/v1/message/schedule");
        return response.data.data;
    }

    async updateScheduledMessage(id: string, options: any): Promise<any> {
        const response = await this.http.put(`/api/v1/message/schedule/${encodeURIComponent(id)}`, options);
        return response.data.data;
    }

    async deleteScheduledMessage(id: string): Promise<void> {
        await this.http.delete(`/api/v1/message/schedule/${encodeURIComponent(id)}`);
    }
}
