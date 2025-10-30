import type { AxiosInstance } from "axios";

export class ICloudModule {
    constructor(private readonly http: AxiosInstance) {}

    async getFindMyFriends(): Promise<any[]> {
        const response = await this.http.get("/api/v1/icloud/findmy/friends");
        return response.data.data;
    }

    async getFindMyDevices(): Promise<any[]> {
        const response = await this.http.get("/api/v1/icloud/findmy/devices");
        return response.data.data;
    }

    async getContactCard(address: string): Promise<any> {
        const response = await this.http.get("/api/v1/icloud/contact", {
            params: { address },
        });
        return response.data.data;
    }
}
