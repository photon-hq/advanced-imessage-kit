/**
 * Example 2: Watch New Messages
 *
 * Demonstrates how to listen for messages using the new concise API
 */

import { AdvancedIMessageKit } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    console.log("Starting to watch messages...");

    // Use concise startWatching API
    await sdk.startWatching({
        onNewMessage: (msg) => {
            const sender = msg.handle?.address ?? "Unknown";
            const text = msg.text ?? "(no text)";
            console.log(`\nNew message from ${sender}: ${text}`);
        },
        onMessageUpdated: (msg) => {
            const status = msg.dateRead ? "read" : msg.dateDelivered ? "delivered" : "sent";
            console.log(`Message status updated: ${status}`);
        },
        onError: (error) => {
            console.error("Error:", error.message);
        },
    });

    // Listen for exit signal
    process.on("SIGINT", async () => {
        console.log("\nStopping watch...");
        await sdk.stopWatching();
        process.exit(0);
    });
}

main().catch(console.error);
