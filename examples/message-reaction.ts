/**
 * Example: Message Reactions
 * Demonstrates how to add reactions (tapbacks) to messages
 */

import { AdvancedIMessageKit } from "../index";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const MESSAGE_GUID = process.env.MESSAGE_GUID;

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        let messageGuid = MESSAGE_GUID;

        if (!messageGuid) {
            const testMessage = await sdk.send(CHAT_GUID, "Test message for reactions!");
            messageGuid = testMessage.guid;
            console.log(`Test message sent: ${messageGuid}`);
        }

        // Add love reaction
        await sdk.reactToMessage(CHAT_GUID, messageGuid, "love");
        console.log("Love reaction added");

        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Add laugh reaction
        await sdk.reactToMessage(CHAT_GUID, messageGuid, "laugh");
        console.log("Laugh reaction added");
    } catch (error) {
        console.error("Failed to send reaction:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
