import type { AdvancedIMessageKit } from "../mobai";

export class ICloudModule {
    constructor(private readonly sdk: AdvancedIMessageKit) {}

    async getFindMyFriends(): Promise<any[]> {
        return this.sdk.request("get-findmy-friends");
    }

    async getFindMyDevices(): Promise<any[]> {
        return this.sdk.request("get-findmy-devices");
    }

    async refreshFindMyFriends(): Promise<void> {
        return this.sdk.request("refresh-findmy-friends");
    }

    async refreshFindMyDevices(): Promise<void> {
        return this.sdk.request("refresh-findmy-devices");
    }
}
