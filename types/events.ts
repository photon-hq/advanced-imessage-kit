import type { FaceTimeStatusData } from "./facetime";
import type { FindMyLocationItem } from "./findmy";
import type { MessageResponse } from "./message";
import type { ScheduledMessageData } from "./scheduled";
import type { BackupData, ServerUpdateData } from "./server";

export interface PhotonEventMap {
    "new-message": MessageResponse;
    "updated-message": MessageResponse;
    "message-updated": MessageResponse;
    "message-send-error": MessageResponse;

    "chat-read-status-changed": { chatGuid: string; read: boolean };
    "group-name-change": MessageResponse;
    "participant-added": MessageResponse;
    "participant-removed": MessageResponse;
    "participant-left": MessageResponse;
    "group-icon-changed": MessageResponse;
    "group-icon-removed": MessageResponse;

    "typing-indicator": { display: boolean; guid: string };

    "new-server": string;
    "server-update": ServerUpdateData;
    "server-update-downloading": ServerUpdateData;
    "server-update-installing": ServerUpdateData;
    "config-update": Record<string, unknown>;

    "incoming-facetime": string; // JSON string of { caller: string; timestamp: number }
    "ft-call-status-changed": FaceTimeStatusData;

    "new-findmy-location": FindMyLocationItem;

    "scheduled-message-created": ScheduledMessageData;
    "scheduled-message-updated": ScheduledMessageData;
    "scheduled-message-deleted": ScheduledMessageData;
    "scheduled-message-sent": ScheduledMessageData;
    "scheduled-message-error": ScheduledMessageData;

    "settings-backup-created": BackupData;
    "settings-backup-updated": BackupData;
    "settings-backup-deleted": BackupData;
    "theme-backup-created": BackupData;
    "theme-backup-updated": BackupData;
    "theme-backup-deleted": BackupData;

    "imessage-aliases-removed": string[];

    "hello-world": undefined;

    connect: undefined;
    disconnect: undefined;
    ready: undefined;
    error: Error;

    log: { level: string; message: string; tag?: string };
}

export type PhotonEventName = keyof PhotonEventMap;

export interface TypedEventEmitter {
    emit<K extends keyof PhotonEventMap>(
        event: K,
        ...args: PhotonEventMap[K] extends undefined ? [] : [PhotonEventMap[K]]
    ): boolean;
    emit(event: string | symbol, ...args: unknown[]): boolean;

    on<K extends keyof PhotonEventMap>(
        event: K,
        listener: PhotonEventMap[K] extends undefined ? () => void : (data: PhotonEventMap[K]) => void,
    ): this;
    on(event: string | symbol, listener: (...args: unknown[]) => void): this;

    once<K extends keyof PhotonEventMap>(
        event: K,
        listener: PhotonEventMap[K] extends undefined ? () => void : (data: PhotonEventMap[K]) => void,
    ): this;
    once(event: string | symbol, listener: (...args: unknown[]) => void): this;

    off<K extends keyof PhotonEventMap>(
        event: K,
        listener: PhotonEventMap[K] extends undefined ? () => void : (data: PhotonEventMap[K]) => void,
    ): this;
    off(event: string | symbol, listener: (...args: unknown[]) => void): this;

    addListener<K extends keyof PhotonEventMap>(
        event: K,
        listener: PhotonEventMap[K] extends undefined ? () => void : (data: PhotonEventMap[K]) => void,
    ): this;
    addListener(event: string | symbol, listener: (...args: unknown[]) => void): this;

    removeListener<K extends keyof PhotonEventMap>(
        event: K,
        listener: PhotonEventMap[K] extends undefined ? () => void : (data: PhotonEventMap[K]) => void,
    ): this;
    removeListener(event: string | symbol, listener: (...args: unknown[]) => void): this;
}
