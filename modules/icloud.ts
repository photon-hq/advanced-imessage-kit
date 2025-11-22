import type { RemoteClient } from "../remoteClient";

export class ICloudModule {
    constructor(private readonly sdk: RemoteClient) {}

    async getFindMyFriends(): Promise<any[]> {
        return this.sdk.request("get-findmy-friends");
    }

    async refreshFindMyFriends(): Promise<any[]> {
        return this.sdk.request("refresh-findmy-friends");
    }
}
