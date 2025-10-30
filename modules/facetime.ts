import type { AxiosInstance } from "axios";

export class FaceTimeModule {
    constructor(private readonly http: AxiosInstance) {}

    async createFaceTimeLink(): Promise<string> {
        const response = await this.http.post("/api/v1/facetime/session");
        return response.data.data;
    }
}
