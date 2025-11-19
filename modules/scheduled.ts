import type { AdvancedIMessageKit } from "../mobai";

export class ScheduledMessageModule {
    constructor(private readonly sdk: AdvancedIMessageKit) {}

    async createScheduledMessage(options: any): Promise<any> {
        return this.sdk.request("create-scheduled-message", options);
    }

    async getScheduledMessages(): Promise<any[]> {
        return this.sdk.request("get-scheduled-messages");
    }

    async updateScheduledMessage(id: string, options: any): Promise<any> {
        return this.sdk.request("update-scheduled-message", { id, ...options });
    }

    async deleteScheduledMessage(id: string): Promise<void> {
        return this.sdk.request("delete-scheduled-message", { id });
    }
}
