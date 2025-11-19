import type { AdvancedIMessageKit } from "../mobai";

export class ICloudModule {
    constructor(private readonly sdk: AdvancedIMessageKit) {}

    async getFindMyFriends(): Promise<any[]> {
        return this.sdk.request("get-findmy-friends");
    }

    async refreshFindMyFriends(): Promise<any[]> {
        return this.sdk.request("refresh-findmy-friends");
    }
}
