import type { AxiosInstance } from "axios";

export class HandleModule {
    constructor(private readonly http: AxiosInstance) {}

    async getHandleCount(): Promise<number> {
        const response = await this.http.get("/api/v1/handle/count");
        return response.data.data.total;
    }

    async queryHandles(options?: { address?: string; with?: string[]; offset?: number; limit?: number }): Promise<{
        data: any[];
        metadata: { total: number; offset: number; limit: number; count: number };
    }> {
        const body: Record<string, any> = {};
        if (options?.address) body.address = options.address;
        if (options?.with) body.with = options.with.join(",");
        if (options?.offset !== undefined) body.offset = options.offset;
        if (options?.limit !== undefined) body.limit = options.limit;

        const response = await this.http.post("/api/v1/handle/query", body);
        return {
            data: response.data.data,
            metadata: response.data.metadata,
        };
    }

    async getHandle(guid: string): Promise<any> {
        const response = await this.http.get(`/api/v1/handle/${guid}`);
        return response.data.data;
    }

    async getHandleAvailability(address: string, type: "imessage" | "facetime"): Promise<boolean> {
        const response = await this.http.get(`/api/v1/handle/availability/${type}`, {
            params: { address },
        });
        return response.data.data.available;
    }

    async getHandleFocusStatus(guid: string): Promise<string> {
        const response = await this.http.get(`/api/v1/handle/${guid}/focus`);
        return response.data.data.status;
    }
}
