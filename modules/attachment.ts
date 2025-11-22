import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { RemoteClient } from "../remoteClient";
import type { SendAttachmentOptions, SendStickerOptions, QueuedAttachmentResult, SocketEventMap } from "../types";
import * as base64 from "byte-base64";

export class AttachmentModule {
    constructor(private readonly sdk: RemoteClient) {}

    async getAttachmentCount(): Promise<number> {
        const res = await this.sdk.request<SocketEventMap["get-attachment-count"]["res"]>("get-attachment-count");
        // Assuming response format is { total: number }
        return res.total;
    }

    async getAttachment(guid: string): Promise<SocketEventMap["get-attachment"]["res"]> {
        const payload: SocketEventMap["get-attachment"]["req"] = { identifier: guid };
        return this.sdk.request("get-attachment", payload);
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
            const payload: SocketEventMap["get-attachment-chunk"]["req"] = {
                identifier: guid,
                start,
                chunkSize,
                compress: false, // Simplification
            };
            const res = await this.sdk.request("get-attachment-chunk", payload);
            
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
            const payload: SocketEventMap["get-live-attachment-chunk"]["req"] = {
                identifier: guid,
                start,
                chunkSize,
                compress: false,
            };
            const res = await this.sdk.request("get-live-attachment-chunk", payload);

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
        const payload: SocketEventMap["get-attachment-blurhash"]["req"] = {
            identifier: guid,
            ...options,
        };
        return this.sdk.request("get-attachment-blurhash", payload);
    }

    async sendAttachment(options: SendAttachmentOptions): Promise<QueuedAttachmentResult> {
        // Socket upload uses send-message-chunk logic
        let fileBuffer: Buffer;
        let fileName = options.fileName;

        if (options.fileBuffer) {
            fileBuffer = options.fileBuffer;
            if (!fileName) {
                throw new Error("fileName is required when sending attachment from buffer");
            }
        } else if (options.filePath) {
            fileBuffer = await readFile(options.filePath);
            if (!fileName) {
                fileName = path.basename(options.filePath);
            }
        } else {
            throw new Error("Either filePath or fileBuffer must be provided");
        }

        const attachmentGuid = randomUUID();
        const tempGuid = randomUUID();
        
        // Chunked upload logic
        const chunkSize = 1024 * 1024; // 1MB
        let start = 0;
        
        while (start < fileBuffer.length) {
            const end = Math.min(start + chunkSize, fileBuffer.length);
            const chunk = fileBuffer.slice(start, end);
            const hasMore = end < fileBuffer.length;
            
            const payload: SocketEventMap["send-message-chunk"]["req"] = {
                guid: options.chatGuid,
                tempGuid,
                message: null, // No text for pure attachment send usually
                attachmentGuid,
                attachmentChunkStart: start,
                attachmentData: base64.bytesToBase64(chunk),
                hasMore,
                attachmentName: fileName!, // fileName is guaranteed to be set here
                isSticker: options.isSticker ?? false,
                isAudioMessage: options.isAudioMessage ?? false,
                selectedMessageGuid: options.selectedMessageGuid,
            };

            await this.sdk.request("send-message-chunk", payload);
            
            start = end;
        }
        
        // The final chunk queues an attachment send job; the socket route does not return the Message.
        // Consumers should rely on the new-message event and match by tempGuid.
        return {
            chatGuid: options.chatGuid,
            tempGuid,
            attachmentGuid,
        };
    }

    async sendSticker(options: SendStickerOptions): Promise<QueuedAttachmentResult> {
        if (!options.filePath) {
            throw new Error("filePath is required for sendSticker helper");
        }
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
