/**
 * Example: Scheduled Messages
 * Demonstrates how to create and manage scheduled messages (requires private API)
 */

import { AdvancedIMessageKit } from "../index";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

        console.log(`Creating scheduled message for ${fiveMinutesFromNow.toLocaleString()}`);
        const scheduled = await sdk.createScheduledMessage(
            CHAT_GUID,
            "This message was scheduled!",
            fiveMinutesFromNow,
        );

        console.log(`Scheduled message created: ${scheduled.id}`);

        const tomorrow9AM = new Date();
        tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
        tomorrow9AM.setHours(9, 0, 0, 0);

        console.log(`Creating recurring scheduled message for ${tomorrow9AM.toLocaleString()}`);
        const recurring = await sdk.createRecurringMessage(CHAT_GUID, "Good morning!", tomorrow9AM, {
            intervalType: "day",
            interval: 1,
        });

        console.log(`Recurring message created: ${recurring.id}`);

        const allScheduled = await sdk.getScheduledMessages();
        console.log(`\nTotal scheduled messages: ${allScheduled.length}\n`);

        allScheduled.forEach((msg, i) => {
            console.log(`${i + 1}. ${msg.payload.message}`);
            console.log(`   ID: ${msg.id}`);
            console.log(`   Type: ${msg.schedule.type}`);
            console.log(`   Scheduled for: ${new Date(msg.scheduledFor).toLocaleString()}`);
        });
    } catch (error) {
        console.error("Failed to manage scheduled messages:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
