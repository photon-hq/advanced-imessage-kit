import type { AdvancedIMessageKit } from "../mobai";

export class HandleModule {
    constructor(private readonly sdk: AdvancedIMessageKit) {}

    async getHandleCount(): Promise<number> {
        const res = await this.sdk.request("get-handle-count");
        return res.total;
    }

    async queryHandles(options?: { address?: string; with?: string[]; offset?: number; limit?: number }): Promise<{
        data: any[];
        metadata: { total: number; offset: number; limit: number; count: number };
    }> {
        return this.sdk.request("query-handles", options);
    }

    async getHandle(guid: string): Promise<any> {
        return this.sdk.request("get-handle", { guid });
    }

    async getHandleAvailability(address: string, type: "imessage" | "facetime"): Promise<boolean> {
        const res = await this.sdk.request("check-handle-availability", {
            address,
            service: type
        });
        return res.available;
    }

    async getHandleFocusStatus(guid: string): Promise<string> {
        // Socket route `get-handle-focus-status` returns { status: string }
        const res = await this.sdk.request<{ status: string }>("get-handle-focus-status", { guid });
        return res.status;
    }
}
