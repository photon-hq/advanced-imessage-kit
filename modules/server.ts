import type { AxiosInstance } from "axios";

export class ServerModule {
    constructor(private readonly http: AxiosInstance) {}

    async getServerInfo(): Promise<any> {
        const response = await this.http.get("/api/v1/server/info");
        return response.data.data;
    }

    async getMessageStats(): Promise<any> {
        const response = await this.http.get("/api/v1/server/statistics/totals");
        return response.data.data;
    }
}
