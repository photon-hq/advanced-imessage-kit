import type { Handle, HandleResponse } from "./handle";
import type { MessageResponse } from "./message";

export interface Chat {
    guid: string;
    chatIdentifier: string;
    displayName?: string;
    participants?: Handle[];
    style?: number;
}

export type ChatResponse = {
    originalROWID: number;
    guid: string;
    participants?: HandleResponse[];
    messages?: MessageResponse[];
    lastMessage?: MessageResponse;
    properties?: NodeJS.Dict<any>[] | null;
    style: number;
    chatIdentifier: string;
    isArchived: boolean;
    isFiltered?: boolean;
    displayName: string;
    groupId?: string;
    lastAddressedHandle?: string | null;
};
