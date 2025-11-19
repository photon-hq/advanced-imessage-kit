import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AdvancedIMessageKit } from "../mobai";
import type { Message } from "../interfaces";
import type { SendAttachmentOptions, SendStickerOptions } from "../types";
import * as base64 from "byte-base64";

export class AttachmentModule {
    constructor(private readonly sdk: AdvancedIMessageKit) {}

    async getAttachmentCount(): Promise<number> {
        const res = await this.sdk.request("get-attachment-count");
        // Assuming response format is { total: number }
        return res.total;
    }

    async getAttachment(guid: string): Promise<any> {
        return this.sdk.request("get-attachment", { identifier: guid });
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
        // Download attachment in chunks using the get-attachment-chunk socket route.
        
        let buffer = Buffer.alloc(0);
        let start = 0;
        const chunkSize = 1024 * 1024; // 1MB
        
        while (true) {
            const res = await this.sdk.request<{ data: string } | null>("get-attachment-chunk", {
                identifier: guid,
                start,
                chunkSize,
                compress: false // Simplification
            });
            
            if (!res || !res.data) break;
            
            const chunk = Buffer.from(res.data, 'base64');
            buffer = Buffer.concat([buffer, chunk]);
            start += chunk.length;
            
            if (chunk.length < chunkSize) break;
        }
        
        return buffer;
    }

    async downloadAttachmentLive(guid: string): Promise<Buffer> {
        // Live Photo video part download via dedicated socket event
        let buffer = Buffer.alloc(0);
        let start = 0;
        const chunkSize = 1024 * 1024; // 1MB

        while (true) {
            const res = await this.sdk.request<{ data: string } | null>("get-live-attachment-chunk", {
                identifier: guid,
                start,
                chunkSize,
                compress: false,
            });

            if (!res || !res.data) break;

            const chunk = Buffer.from(res.data, "base64");
            buffer = Buffer.concat([buffer, chunk]);
            start += chunk.length;

            if (chunk.length < chunkSize) break;
        }

        return buffer;
    }

    async getAttachmentBlurhash(
        guid: string,
        options?: { height?: number; width?: number; quality?: number },
    ): Promise<string> {
        // Use the get-attachment-blurhash socket route (may throw if blurhash is unsupported in SDK mode).
        return this.sdk.request("get-attachment-blurhash", { 
            identifier: guid,
            ...options
        });
    }

    async sendAttachment(options: SendAttachmentOptions): Promise<Message> {
        // Socket upload uses send-message-chunk logic
        const fileBuffer = await readFile(options.filePath);
        const fileName = options.fileName || path.basename(options.filePath);
        const attachmentGuid = randomUUID();
        const tempGuid = randomUUID();
        
        // Chunked upload logic
        const chunkSize = 1024 * 1024; // 1MB
        let start = 0;
        
        while (start < fileBuffer.length) {
            const end = Math.min(start + chunkSize, fileBuffer.length);
            const chunk = fileBuffer.slice(start, end);
            const hasMore = end < fileBuffer.length;
            
            await this.sdk.request("send-message-chunk", {
                guid: options.chatGuid,
                tempGuid,
                message: null, // No text for pure attachment send usually
                attachmentGuid,
                attachmentChunkStart: start,
                attachmentData: base64.bytesToBase64(chunk),
                hasMore,
                attachmentName: fileName
            });
            
            start = end;
        }
        
        // The final chunk queues an attachment send job; the socket route does not return the Message.
        // Consumers should rely on the new-message event and match by tempGuid.
        return { guid: tempGuid } as any;
    }

    async sendSticker(options: SendStickerOptions): Promise<Message> {
        return this.sendAttachment({
            chatGuid: options.chatGuid,
            filePath: options.filePath,
            fileName: options.fileName,
            isAudioMessage: false,
            isSticker: true,
            selectedMessageGuid: options.selectedMessageGuid,
        });
    }
}
