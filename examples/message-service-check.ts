/**
 * Example: Message Service Check
 * Monitors incoming messages and displays their service type (iMessage or SMS)
 */

import { AdvancedIMessageKit, type Message } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    console.log("Connecting to server...");
    await sdk.connect();
    console.log("Monitoring messages for service type\n");

    await sdk.startWatching({
        onNewMessage: (message: Message) => {
            if (message.isFromMe) return;

            const service = message.service || message.chats?.[0]?.guid?.split(";")[0] || "Unknown";
            const isIMessage = service === "iMessage";

            console.log(`${service} | ${message.handle?.address || "Unknown"} | ${message.text || "(no text)"}`);
        },
    });

    // Handle exit
    process.on("SIGINT", async () => {
        console.log("\nShutting down...");
        await sdk.close();
        process.exit(0);
    });
}

main().catch(console.error);
