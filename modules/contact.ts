import type { RemoteClient } from "../remoteClient";

export class ContactModule {
    constructor(private readonly sdk: RemoteClient) {}

    async getContacts(): Promise<any[]> {
        return this.sdk.request("get-contacts");
    }

    async getContactCard(address: string): Promise<any> {
        return this.sdk.request("get-icloud-contact-card", { address });
    }

    async shareContactCard(chatGuid: string): Promise<void> {
        return this.sdk.request("share-contact-card", { chatGuid });
    }

    async shouldShareContact(chatGuid: string): Promise<boolean> {
        return this.sdk.request("check-share-contact-status", { chatGuid });
    }
}
