/**
 * Example: Typing Indicators
 * Demonstrates how to show typing indicators (requires private API)
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
        console.log(`Starting typing indicator for ${CHAT_GUID}`);
        await sdk.startTyping(CHAT_GUID);

        await new Promise((resolve) => setTimeout(resolve, 3000));

        await sdk.send(CHAT_GUID, "Hello! I was typing for a moment");

        await new Promise((resolve) => setTimeout(resolve, 2000));

        await sdk.startTyping(CHAT_GUID);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        await sdk.stopTyping(CHAT_GUID);

        console.log("Typing indicator demo complete");
    } catch (error) {
        console.error("Typing indicator demo failed:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
