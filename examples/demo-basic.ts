/**
 * Example: Basic Demo
 * Simple example showing basic SDK usage and event listening
 */

import { AdvancedIMessageKit } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    console.log("Connecting to iMessage server...");
    await sdk.connect();
    console.log("Connected! Listening for messages...\n");

    await sdk.startWatching({
        onNewMessage: (message) => {
            console.log(`\n${message.handle?.address ?? "Unknown"}: ${message.text ?? "(no text)"}`);
        },
        onMessageUpdated: (message) => {
            const status = message.dateRead ? "read" : message.dateDelivered ? "delivered" : "sent";
            console.log(`Message ${status}`);
        },
        onError: (error) => {
            console.error("Error:", error.message);
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
