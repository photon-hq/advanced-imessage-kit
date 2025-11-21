import type { Chat } from "./chat";
import type { Message } from "./message";
import type { Attachment } from "./attachment";
import type { ServerMetadataResponse } from "./server";
import type { ScheduledMessage, ScheduledMessagePayload, ScheduledMessageSchedule, ScheduledMessageType } from "./scheduled";

// Central mapping of Socket.IO events used by the SDK to their
// request and response payload types. This is intentionally
// incremental: not every server event is listed, only those
// directly used by the public SDK methods.
export interface SocketEventMap {
    // General / Server
    "get-server-metadata": { req: void; res: ServerMetadataResponse };
    "get-logs": { req: { count?: number } | undefined; res: string[] };
    "get-alerts": { req: void; res: any[] };
    "mark-alert-read": { req: { ids: string[] }; res: any };
    "get-database-totals": { req: any; res: any };
    "get-media-totals": { req: { only?: string[] } | undefined; res: any };
    "get-media-totals-by-chat": { req: { only?: string[] } | undefined; res: any };

    // Chats
    "get-chats": { req: void; res: Chat[] };
    "get-chat": { req: { chatGuid: string; with?: string[] }; res: Chat };
    "get-chat-messages": {
        req: {
            identifier: string;
            offset?: number;
            limit?: number;
            after?: number | Date;
            before?: number | Date;
            withChats?: boolean;
            withChatParticipants?: boolean;
            withAttachments?: boolean;
            sort?: "ASC" | "DESC";
            where?: unknown;
        };
        res: Message[];
    };
    "start-chat": {
        req: {
            participants: string | string[];
            message?: string;
            service?: string;
            tempGuid?: string;
        };
        res: Chat;
    };
    "rename-group": { req: { identifier: string; newName: string }; res: Chat };
    "delete-chat": { req: { chatGuid: string }; res: void };
    "mark-chat-read": { req: { chatGuid: string }; res: void };
    "mark-chat-unread": { req: { chatGuid: string }; res: void };
    "leave-chat": { req: { chatGuid: string }; res: void };
    "add-participant": { req: { identifier: string; address: string }; res: Chat };
    "remove-participant": { req: { identifier: string; address: string }; res: Chat };
    "get-chat-count": { req: { includeArchived?: boolean } | undefined; res: { total: number; breakdown: Record<string, number> } };
    "set-group-icon": { req: { chatGuid: string; iconData: string }; res: void };
    "remove-group-icon": { req: { chatGuid: string }; res: void };
    "get-group-icon": { req: { chatGuid: string }; res: string };
    "started-typing": { req: { chatGuid: string }; res: void };
    "stopped-typing": { req: { chatGuid: string }; res: void };

    // Messages
    "send-message": {
        req: {
            guid: string;
            message?: string;
            tempGuid?: string | number;
            attachment?: string;
            attachmentName?: string;
            attachmentGuid?: string;
        };
        res: Message;
    };
    "get-message": { req: { guid: string; with?: string[] }; res: Message };
    "get-messages": {
        req: {
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
        };
        res: Message[];
    };
    "get-message-count": {
        req: {
            chatGuid?: string;
            after?: number | Date;
            before?: number | Date;
            includeCreated?: boolean;
        } | undefined;
        res: { total: number };
    };
    "get-updated-message-count": {
        req: {
            chatGuid?: string;
            after?: number | Date;
            before?: number | Date;
        } | undefined;
        res: { total: number };
    };
    "get-sent-message-count": {
        req: {
            chatGuid?: string;
            after?: number | Date;
            before?: number | Date;
        } | undefined;
        res: { total: number };
    };
    "edit-message": {
        req: {
            chatGuid: string;
            messageGuid: string;
            editedMessage: string;
            backwardsCompatMessage: string;
            partIndex: number;
        };
        res: Message;
    };
    "send-reaction": {
        req: {
            chatGuid: string;
            tempGuid?: string | null;
            messageGuid: string;
            tapback?: string;
            messageText?: string;
            actionMessageGuid?: string;
            actionMessageText?: string;
            partIndex?: number;
        };
        res: Message;
    };
    "unsend-message": {
        req: {
            chatGuid: string;
            messageGuid: string;
            partIndex: number;
        };
        res: Message;
    };
    "notify-message": {
        req: { chatGuid: string; messageGuid: string };
        res: Message;
    };
    "get-embedded-media": {
        req: { chatGuid: string; messageGuid: string };
        res: string | null;
    };

    // Attachments
    "get-attachment-count": { req: void; res: { total: number } };
    "get-attachment": { req: { identifier: string }; res: Attachment | any };
    "get-attachment-blurhash": {
        req: { identifier: string; width?: number; height?: number; quality?: number | string };
        res: string;
    };
    "get-attachment-chunk": {
        req: { identifier: string; start?: number; chunkSize?: number; compress?: boolean };
        res: { data: string } | null;
    };
    "get-live-attachment-chunk": {
        req: { identifier: string; start?: number; chunkSize?: number; compress?: boolean };
        res: { data: string } | null;
    };
    "send-message-chunk": {
        req: {
            guid: string;
            tempGuid: string;
            message?: string | null;
            attachmentGuid?: string;
            attachmentChunkStart?: number;
            attachmentData?: string;
            hasMore?: boolean;
            attachmentName?: string;
            isSticker?: boolean;
            isAudioMessage?: boolean;
            selectedMessageGuid?: string;
        };
        res: any;
    };

    // Contacts / iCloud
    "get-contacts": { req: void | { query?: string; extraProperties?: string[] }; res: any[] };
    "get-icloud-contact-card": { req: { address: string }; res: any };
    "share-contact-card": { req: { chatGuid: string }; res: void };
    "check-share-contact-status": { req: { chatGuid: string }; res: boolean };

    // Handles
    "get-handle-count": { req: void; res: { total: number } };
    "query-handles": { req: any; res: { data: any[]; metadata: { total: number; offset: number; limit: number; count: number } } };
    "get-handle": { req: { guid: string }; res: any };
    "check-handle-availability": { req: { address: string; service: string }; res: { available: boolean; address: string; service: string } };
    "get-handle-focus-status": { req: { guid: string }; res: { status: string } };

    // Find My / iCloud
    "get-findmy-friends": { req: void; res: any[] };
    "refresh-findmy-friends": { req: void; res: any[] };

    // FaceTime
    "start-facetime-session": { req: void; res: string };

    // Scheduled messages
    "create-scheduled-message": {
        req: {
            type: ScheduledMessageType;
            payload: ScheduledMessagePayload;
            scheduledFor: Date | string | number;
            schedule: ScheduledMessageSchedule;
        };
        res: ScheduledMessage;
    };
    "get-scheduled-messages": { req: void; res: ScheduledMessage[] };
    "update-scheduled-message": {
        req: {
            id: number | string;
            type: ScheduledMessageType;
            payload: ScheduledMessagePayload;
            scheduledFor: Date | string | number;
            schedule: ScheduledMessageSchedule;
        };
        res: ScheduledMessage;
    };
    "delete-scheduled-message": { req: { id: string | number }; res: void };
}
