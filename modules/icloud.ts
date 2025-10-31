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

    async refreshFindMyFriends(): Promise<void> {
        await this.http.post("/api/v1/icloud/findmy/friends/refresh");
    }

    async refreshFindMyDevices(): Promise<void> {
        await this.http.post("/api/v1/icloud/findmy/devices/refresh");
    }
}
