export interface SendStickerOptions {
    chatGuid: string;
    filePath: string;
    fileName?: string;

    selectedMessageGuid?: string;
    stickerX?: number; // Sticker X position (0.0 - 1.0, relative to message bubble). Default: 0.5 (center). Only used for tapback stickers.
    stickerY?: number; // Sticker Y position (0.0 - 1.0, relative to message bubble). Default: 0.5 (center). Only used for tapback stickers.
    stickerScale?: number; // Sticker scale (0.0 - 1.0). Default: 0.75. Only used for tapback stickers.
    stickerRotation?: number; // Sticker rotation in radians. Default: 0. Only used for tapback stickers.
    stickerWidth?: number; // Sticker width in points. Default: 300. Only used for tapback stickers.
}
