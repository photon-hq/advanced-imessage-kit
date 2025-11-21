import type { SendMessageOptions } from "./message";

export type ScheduledMessageStatus = "pending" | "in-progress" | "complete" | "error";

export type ScheduledMessageType = "send-message";

export type ScheduledMessageScheduleType = "once" | "recurring";

export interface ScheduledMessageSchedule {
    type: ScheduledMessageScheduleType;
    intervalType?: string;
    interval?: number;
}

export interface ScheduledMessagePayload extends SendMessageOptions {
    method?: "apple-script" | "private-api";
    ddScan?: boolean;
}

export interface ScheduledMessage {
    id: number;
    type: ScheduledMessageType;
    payload: ScheduledMessagePayload;
    scheduledFor: string | number | Date;
    schedule: ScheduledMessageSchedule;
    status: ScheduledMessageStatus;
    error?: string | null;
    sentAt?: string | number | Date | null;
    created?: string | number | Date;
}

export interface CreateScheduledMessageOptions extends ScheduledMessagePayload {
    scheduledFor: Date;
    schedule: ScheduledMessageSchedule;
}

export interface UpdateScheduledMessageOptions extends ScheduledMessagePayload {
    scheduledFor: Date;
    schedule: ScheduledMessageSchedule;
}
