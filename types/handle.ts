export interface Handle {
    address: string;
    id: string;
    country?: string;
    service?: string;
}

export type HandleResponse = {
    originalROWID: number;
    messages?: import("./message").MessageResponse[];
    chats?: import("./chat").ChatResponse[];
    address: string;
    service: string;
    country?: string;
    uncanonicalizedId?: string;
};
