import type { AdvancedIMessageKit } from "../mobai";

export class FaceTimeModule {
    constructor(private readonly sdk: AdvancedIMessageKit) {}

    async createFaceTimeLink(): Promise<string> {
        return this.sdk.request("start-facetime-session");
    }
}
