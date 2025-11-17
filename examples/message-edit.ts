/**
 * Example: Edit Message
 * Demonstrates how to edit a message after sending it
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
        const message = await sdk.send(CHAT_GUID, "This is the original messge with a typo!");
        console.log(`Message sent: ${message.guid}`);

        console.log("Waiting 5 seconds before editing...");
        await new Promise((resolve) => setTimeout(resolve, 5000));

        await sdk.editMessage(message.guid, "This is the original message with a typo! (Fixed)");
        console.log(`Message edited: ${message.guid}`);
    } catch (error) {
        console.error("Failed to edit message:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
