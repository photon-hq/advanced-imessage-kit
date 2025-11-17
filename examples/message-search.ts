/**
 * Example: Search Messages
 * Demonstrates how to retrieve and display messages from a chat
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
        const messages = await sdk.getMessages(CHAT_GUID, {
            limit: 20,
            sort: "DESC",
        });

        console.log(`Found ${messages.length} messages\n`);

        messages.slice(0, 5).forEach((msg, i) => {
            const sender = msg.isFromMe ? "me" : msg.handle?.address || "Unknown";
            console.log(`${i + 1}. ${msg.text || "(attachment)"}`);
            console.log(`   From: ${sender}`);
            console.log(`   Date: ${new Date(msg.dateCreated).toLocaleString()}\n`);
        });
    } catch (error) {
        console.error("Failed to search messages:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
