/**
 * Example 3: Auto Reply
 *
 * Demonstrates how to implement auto-reply using chain API
 */

import { AdvancedIMessageKit, type Message } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    console.log("Starting auto-reply bot...");

    await sdk.startWatching({
        onNewMessage: async (msg) => {
            // Use chain API to handle messages
            await sdk
                .message(msg)
                .ifFromOthers() // Only handle messages from others
                .matchText(/hello|hi/i) // Match greetings
                .replyText("Hello! Nice to hear from you!") // Auto reply
                .execute(); // Execute

            // Handle help requests
            await sdk
                .message(msg)
                .ifFromOthers()
                .matchText(/help/i)
                .replyText(
                    "Welcome to auto-reply bot!\n" +
                        "Supported commands:\n" +
                        "- hello/hi - Greeting\n" +
                        "- help - Show this message\n" +
                        "- time - Get current time",
                )
                .execute();

            // Return current time
            await sdk
                .message(msg)
                .ifFromOthers()
                .matchText(/time/i)
                .replyText((m: Message) => `Current time: ${new Date().toLocaleString()}`)
                .execute();

            // Handle thanks
            await sdk
                .message(msg)
                .ifFromOthers()
                .matchText(/thanks|thank you/i)
                .replyText("You're welcome!")
                .execute();
        },
    });

    // Listen for exit signal
    process.on("SIGINT", async () => {
        console.log("\nStopping bot...");
        await sdk.stopWatching();
        process.exit(0);
    });
}

main().catch(console.error);
