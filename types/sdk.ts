import type { Message } from "./message";
import type { Chat } from "./chat";

export interface SendResult {
    sentAt: Date;
    message?: Message;
}

export interface MessageQueryOptions {
    chatGuid?: string;
    offset?: number;
    limit?: number;
    after?: number | Date;
    before?: number | Date;
    withChats?: boolean;
    withChatParticipants?: boolean;
    withAttachments?: boolean;
    sort?: "ASC" | "DESC";
    where?: unknown;
}

export interface MessageQueryResult {
    messages: Message[];
    total: number;
    unreadCount: number;
}

export interface UnreadMessagesGroup {
    sender: string;
    messages: Message[];
}

export interface UnreadMessagesResult {
    groups: UnreadMessagesGroup[];
    total: number;
    senderCount: number;
}

export interface ListChatsOptions {
    limit?: number;
    type?: "all" | "group" | "dm";
    hasUnread?: boolean;
    search?: string;
}

export interface ChatSummary {
    chatGuid: string;
    displayName?: string | null;
    lastMessageAt?: Date | null;
    isGroup: boolean;
    unreadCount: number;
    rawChat: Chat;
}
