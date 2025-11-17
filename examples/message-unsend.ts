/**
 * Example: Unsend Message
 * Demonstrates how to unsend (retract) a sent message
 */

import { AdvancedIMessageKit } from "../index";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const MESSAGE_GUID = process.env.UNSEND_MESSAGE_GUID;

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        let messageGuid = MESSAGE_GUID;

        if (!messageGuid) {
            const message = await sdk.send(CHAT_GUID, "This message will be unsent in 3 seconds!");
            messageGuid = message.guid;
            console.log(`Message sent: ${messageGuid}`);

            console.log("Waiting 3 seconds before unsending...");
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        await sdk.unsendMessage(messageGuid);
        console.log(`Message unsent: ${messageGuid}`);
    } catch (error) {
        console.error("Failed to unsend message:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
