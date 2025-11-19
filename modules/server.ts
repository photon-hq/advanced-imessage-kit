import type { AdvancedIMessageKit } from "../mobai";

export class ServerModule {
    constructor(private readonly sdk: AdvancedIMessageKit) {}

    async getServerInfo(): Promise<any> {
        return this.sdk.request("get-server-metadata");
    }

    async getMessageStats(): Promise<any> {
        // Use database totals (handles/messages/chats/attachments)
        return this.sdk.request("get-database-totals");
    }

    async getServerLogs(count?: number): Promise<string[]> {
        return this.sdk.request("get-logs", { count });
    }

    async getAlerts(): Promise<any[]> {
        return this.sdk.request("get-alerts");
    }

    async markAlertAsRead(ids: string[]): Promise<any> {
        return this.sdk.request("mark-alert-read", { ids });
    }

    async getMediaStatistics(options?: { only?: string[] }): Promise<any> {
        const payload = options?.only ? { only: options.only } : undefined;
        return this.sdk.request("get-media-totals", payload);
    }

    async getMediaStatisticsByChat(options?: { only?: string[] }): Promise<any> {
        const payload = options?.only ? { only: options.only } : undefined;
        return this.sdk.request("get-media-totals-by-chat", payload);
    }
}
