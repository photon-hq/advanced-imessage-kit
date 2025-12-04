export interface SendAttachmentOptions {
    chatGuid: string;
    filePath: string;
    fileName?: string;
    isAudioMessage?: boolean;
    selectedMessageGuid?: string;
}

export interface Attachment {
    guid: string;
    originalROWID: number;
    transferName: string;
    totalBytes: number;
    mimeType?: string;
    filePath?: string;
}

export type AttachmentResponse = {
    originalROWID: number;
    guid: string;
    messages?: string[];
    data?: string;
    blurhash?: string;
    height?: number;
    width?: number;
    uti: string;
    mimeType: string;
    transferState?: number;
    totalBytes: number;
    isOutgoing?: boolean;
    transferName: string;
    isSticker?: boolean;
    hideAttachment?: boolean;
    originalGuid?: string;
    metadata?: { [key: string]: string | boolean | number };
    hasLivePhoto?: boolean;
};
