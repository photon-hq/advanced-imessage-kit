import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AxiosInstance } from "axios";
import FormData from "form-data";
import type { AttachmentResponse, MessageResponse, SendAttachmentOptions, SendStickerOptions } from "../types";

export class AttachmentModule {
    constructor(
        private readonly http: AxiosInstance,
        private readonly enqueueSend: <T>(task: () => Promise<T>) => Promise<T> = (task) => task(),
    ) {}

    async getAttachmentCount(): Promise<number> {
        const response = await this.http.get("/api/v1/attachment/count");
        return response.data.data.total;
    }

    async getAttachment(guid: string): Promise<AttachmentResponse> {
        const response = await this.http.get(`/api/v1/attachment/${guid}`);
        return response.data.data;
    }

    async downloadAttachment(
        guid: string,
        options?: {
            original?: boolean;
            force?: boolean;
            height?: number;
            width?: number;
            quality?: number;
        },
    ): Promise<Buffer> {
        const params: Record<string, unknown> = {};
        if (options?.original !== undefined) params.original = options.original;
        if (options?.force !== undefined) params.force = options.force;
        if (options?.height !== undefined) params.height = options.height;
        if (options?.width !== undefined) params.width = options.width;
        if (options?.quality !== undefined) params.quality = options.quality;

        const response = await this.http.get(`/api/v1/attachment/${guid}/download`, {
            params,
            responseType: "arraybuffer",
        });
        return Buffer.from(response.data);
    }

    async downloadAttachmentLive(guid: string): Promise<Buffer> {
        const response = await this.http.get(`/api/v1/attachment/${guid}/live`, {
            responseType: "arraybuffer",
        });
        return Buffer.from(response.data);
    }

    async getAttachmentBlurhash(
        guid: string,
        options?: { height?: number; width?: number; quality?: number },
    ): Promise<string> {
        const params: Record<string, unknown> = {};
        if (options?.height !== undefined) params.height = options.height;
        if (options?.width !== undefined) params.width = options.width;
        if (options?.quality !== undefined) params.quality = options.quality;

        const response = await this.http.get(`/api/v1/attachment/${guid}/blurhash`, {
            params,
        });
        return response.data.data.blurhash;
    }

    async sendAttachment(options: SendAttachmentOptions): Promise<MessageResponse> {
        return this.enqueueSend(async () => {
            const fileBuffer = await readFile(options.filePath);
            const fileName = options.fileName || path.basename(options.filePath);

            const form = new FormData();
            form.append("chatGuid", options.chatGuid);
            form.append("attachment", fileBuffer, fileName);
            form.append("name", fileName);
            form.append("tempGuid", randomUUID());
            if (options.isAudioMessage !== undefined) {
                form.append("isAudioMessage", options.isAudioMessage.toString());
                if (options.isAudioMessage) {
                    form.append("method", "private-api");
                }
            }

            const response = await this.http.post("/api/v1/message/attachment", form, {
                headers: form.getHeaders(),
            });

            return response.data.data;
        });
    }

    async sendSticker(options: SendStickerOptions): Promise<MessageResponse> {
        return this.enqueueSend(async () => {
            const fileName = options.fileName || path.basename(options.filePath);
            const form = new FormData();

            form.append("attachment", await readFile(options.filePath), fileName);

            const { data } = await this.http.post("/api/v1/attachment/upload", form, {
                headers: form.getHeaders(),
            });
            const response = await this.http.post("/api/v1/message/multipart", {
                chatGuid: options.chatGuid,
                selectedMessageGuid: options.selectedMessageGuid,
                parts: [{ partIndex: 0, attachment: data.data.path, name: fileName }],
            });

            return response.data.data;
        });
    }
}
