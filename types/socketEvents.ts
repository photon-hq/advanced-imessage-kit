import type { Chat } from "./chat";
import type { Message } from "./message";
import type { Attachment } from "./attachment";
import type { ServerMetadataResponse } from "./server";

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
    "get-chat-messages": { req: any; res: Message[] };
    "start-chat": { req: any; res: Chat };
    "rename-group": { req: any; res: Chat };
    "delete-chat": { req: { chatGuid: string }; res: void };
    "mark-chat-read": { req: { chatGuid: string }; res: void };
    "mark-chat-unread": { req: { chatGuid: string }; res: void };
    "leave-chat": { req: { chatGuid: string }; res: void };
    "add-participant": { req: any; res: Chat };
    "remove-participant": { req: any; res: Chat };
    "get-chat-count": { req: { includeArchived?: boolean } | undefined; res: { total: number; breakdown: Record<string, number> } };
    "set-group-icon": { req: any; res: void };
    "remove-group-icon": { req: { chatGuid: string }; res: void };
    "get-group-icon": { req: { chatGuid: string }; res: string };
    "started-typing": { req: { chatGuid: string }; res: void };
    "stopped-typing": { req: { chatGuid: string }; res: void };

    // Messages
    "send-message": { req: any; res: Message };
    "get-message": { req: { guid: string; with?: string[] }; res: Message };
    "get-messages": { req: any; res: Message[] };
    "get-message-count": { req: any; res: { total: number } };
    "get-updated-message-count": { req: any; res: { total: number } };
    "get-sent-message-count": { req: any; res: { total: number } };
    "edit-message": { req: any; res: Message };
    "send-reaction": { req: any; res: Message };
    "unsend-message": { req: any; res: Message };
    "notify-message": { req: any; res: any };
    "get-embedded-media": { req: any; res: any };

    // Attachments
    "get-attachment-count": { req: void; res: { total: number } };
    "get-attachment": { req: { identifier: string }; res: Attachment | any };
    "get-attachment-blurhash": { req: any; res: string };
    "get-attachment-chunk": { req: any; res: { data: string } | null };
    "get-live-attachment-chunk": { req: any; res: { data: string } | null };
    "send-message-chunk": { req: any; res: any };

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
    "create-scheduled-message": { req: any; res: any };
    "get-scheduled-messages": { req: void; res: any[] };
    "update-scheduled-message": { req: any; res: any };
    "delete-scheduled-message": { req: { id: string | number }; res: void };
}
