/**
 * Example: Reply with Sticker
 * Demonstrates how to send a sticker as a reply to a message
 */

import path from "node:path";
import { AdvancedIMessageKit } from "../index";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const STICKER_PATH = process.env.STICKER_PATH || path.join(__dirname, "test-image.jpg");

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    console.log("Sticker message example\n");

    try {
        console.log("Sending a text message first...");
        const textMessage = await sdk.send(CHAT_GUID, "Here comes a sticker!");

        console.log(`Text message sent! GUID: ${textMessage.guid}`);
        console.log(`Text: "${textMessage.text}"\n`);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Sending sticker as a file attachment...");
        await sdk.sendFile(CHAT_GUID, STICKER_PATH, "Sticker");

        console.log("\nSticker sent successfully!");
    } catch (error) {
        console.error("Failed to send sticker:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
