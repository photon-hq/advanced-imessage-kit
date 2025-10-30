export interface Message {
    guid: string;
    text: string;
    handle?: any;
    chats?: any[];
    attachments?: any[];
    subject: string;
    error: number;
    dateCreated: number;
    dateRead: number | null;
    dateDelivered: number | null;
    isFromMe: boolean;
    isDelivered?: boolean;
    isArchived: boolean;
    isAudioMessage?: boolean;
    datePlayed?: number | null;
    itemType: number;
    groupTitle: string | null;
    groupActionType: number;
    dateEdited?: number | null;
}

export interface Chat {
    guid: string;
    chatIdentifier: string;
    displayName?: string;
    participants?: any[];
    style: number;
}

export interface Handle {
    address: string;
    id: string;
}
