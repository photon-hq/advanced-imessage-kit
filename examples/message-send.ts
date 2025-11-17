/**
 * Example: Send Simple Message
 * Demonstrates basic message sending functionality
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
        const message = await sdk.send(CHAT_GUID, "Hello from Advanced iMessage Kit!");
        console.log(`Message sent: ${message.guid}`);
        console.log(`Time: ${new Date(message.dateCreated).toLocaleString()}`);
    } catch (error) {
        console.error("Failed to send message:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
