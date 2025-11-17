/**
 * Example: Reply to Message
 * Demonstrates how to send a message that replies to another message
 */

import { AdvancedIMessageKit } from "../index";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    console.log("Message reply example\n");

    try {
        console.log("Sending original message...");
        const originalMessage = await sdk.send(CHAT_GUID, "What's your favorite color?");

        console.log(`Original message sent! GUID: ${originalMessage.guid}`);
        console.log(`Text: "${originalMessage.text}"\n`);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Sending reply to the original message...");
        const replyMessage = await sdk.send(CHAT_GUID, "My favorite color is blue!");

        console.log("\nReply sent successfully!");
        console.log(`Reply message GUID: ${replyMessage.guid}`);
        console.log(`Reply text: "${replyMessage.text}"`);
    } catch (error) {
        console.error("Failed to send reply:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
