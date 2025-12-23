import type { AxiosInstance } from "axios";
import type { FindMyLocationItem } from "../types/findmy";

export class ICloudModule {
    constructor(private readonly http: AxiosInstance) {}

    async getFindMyFriends(): Promise<FindMyLocationItem[]> {
        const response = await this.http.get("/api/v1/icloud/findmy/friends");
        return response.data.data;
    }

    async refreshFindMyFriends(): Promise<FindMyLocationItem[]> {
        const response = await this.http.post("/api/v1/icloud/findmy/friends/refresh");
        return response.data.data;
    }

    async getLocationForHandle(handle: string): Promise<FindMyLocationItem | null> {
        const friends = await this.getFindMyFriends();
        return friends.find((f) => f.handle === handle) ?? null;
    }

    async isHandleSharingLocation(handle: string): Promise<boolean> {
        const location = await this.getLocationForHandle(handle);
        return location !== null;
    }
}
