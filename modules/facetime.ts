import type { RemoteClient } from "../remoteClient";

export class FaceTimeModule {
    constructor(private readonly sdk: RemoteClient) {}

    async createFaceTimeLink(): Promise<string> {
        return this.sdk.request("start-facetime-session");
    }
}
