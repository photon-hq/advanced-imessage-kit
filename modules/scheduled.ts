import type { RemoteClient } from "../remoteClient";
import type {
    CreateScheduledMessageOptions,
    ScheduledMessage,
    SocketEventMap,
    UpdateScheduledMessageOptions,
} from "../types";

export class ScheduledMessageModule {
    constructor(private readonly sdk: RemoteClient) {}

    async createScheduledMessage(options: CreateScheduledMessageOptions): Promise<ScheduledMessage> {
        const payload: SocketEventMap["create-scheduled-message"]["req"] = {
            type: "send-message",
            payload: {
                chatGuid: options.chatGuid,
                message: options.message,
                tempGuid: options.tempGuid,
                subject: options.subject,
                effectId: options.effectId,
                selectedMessageGuid: options.selectedMessageGuid,
                partIndex: options.partIndex,
                ddScan: options.ddScan,
            },
            scheduledFor: options.scheduledFor,
            schedule: options.schedule,
        };

        return this.sdk.request("create-scheduled-message", payload);
    }

    async getScheduledMessages(): Promise<ScheduledMessage[]> {
        return this.sdk.request("get-scheduled-messages");
    }

    async updateScheduledMessage(id: number | string, options: UpdateScheduledMessageOptions): Promise<ScheduledMessage> {
        const payload: SocketEventMap["update-scheduled-message"]["req"] = {
            id,
            type: "send-message",
            payload: {
                chatGuid: options.chatGuid,
                message: options.message,
                tempGuid: options.tempGuid,
                subject: options.subject,
                effectId: options.effectId,
                selectedMessageGuid: options.selectedMessageGuid,
                partIndex: options.partIndex,
                ddScan: options.ddScan,
            },
            scheduledFor: options.scheduledFor,
            schedule: options.schedule,
        };

        return this.sdk.request("update-scheduled-message", payload);
    }

    async deleteScheduledMessage(id: number | string): Promise<void> {
        return this.sdk.request("delete-scheduled-message", { id });
    }
}
