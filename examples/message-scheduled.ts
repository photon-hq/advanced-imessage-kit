import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

            const scheduled = await sdk.scheduledMessages.createScheduledMessage({
                chatGuid: CHAT_GUID,
                message: "This message was scheduled!",
                scheduledFor: fiveMinutesFromNow,
                schedule: { type: "once" },
            });

            console.log(`scheduled: ${scheduled.id} for ${fiveMinutesFromNow.toLocaleString()}`);

            const tomorrow9AM = new Date();
            tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
            tomorrow9AM.setHours(9, 0, 0, 0);

            const recurring = await sdk.scheduledMessages.createScheduledMessage({
                chatGuid: CHAT_GUID,
                message: "Good morning!",
                scheduledFor: tomorrow9AM,
                schedule: {
                    type: "recurring",
                    intervalType: "day",
                    interval: 1,
                },
            });

            console.log(`recurring: ${recurring.id}`);

            const allScheduled = await sdk.scheduledMessages.getScheduledMessages();
            console.log(`${allScheduled.length} scheduled\n`);

            allScheduled.forEach((msg, i) => {
                console.log(`${i + 1}. ${msg.payload.message}`);
                console.log(`   ${msg.id} (${msg.schedule.type}) - ${new Date(msg.scheduledFor).toLocaleString()}`);
            });

            if (allScheduled.length > 0) {
                const msg = allScheduled[0];
                const newTime = new Date(Date.now() + 10 * 60 * 1000);

                const updated = await sdk.scheduledMessages.updateScheduledMessage(msg.id, {
                    ...msg.payload,
                    message: "Updated message!",
                    scheduledFor: newTime,
                });

                console.log(`updated ${msg.id} to ${new Date(updated.scheduledFor).toLocaleString()}`);
            }
        } catch (error) {
            handleError(error, "Failed to manage scheduled messages");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
