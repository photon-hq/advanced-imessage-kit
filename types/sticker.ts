export interface SendStickerOptions {
    chatGuid: string;
    filePath: string;
    fileName?: string;
    selectedMessageGuid?: string;
    stickerX?: number;
    stickerY?: number;
    stickerScale?: number;
    stickerRotation?: number;
    stickerWidth?: number;
}
