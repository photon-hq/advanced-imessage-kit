export interface ScheduledMessageData {
    id: number;
    chatGuid: string;
    message: string;
    scheduledFor: number;
    createdAt: number;
    type: string;
    payload?: Record<string, unknown>;
}
