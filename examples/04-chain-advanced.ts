/**
 * 示例 4: 高级链式 API 用法
 *
 * 演示链式 API 的各种高级用法
 */

import { AdvancedIMessageKit, type Message } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    console.log("Starting advanced message processing...");

    await sdk.startWatching({
        onNewMessage: async (msg) => {
            // Example 1: Conditional Combination
            await sdk
                .message(msg)
                .ifFromOthers()
                .ifDirectMessage() // Direct messages only
                .when((m: Message) => m.text?.includes("urgent")) // Contains "urgent"
                .replyText("Got it! I'll handle it ASAP.")
                .execute();

            // Example 2: Using Custom Functions
            await sdk
                .message(msg)
                .when((m: Message) => !!m.text && m.text.length > 100) // Long message
                .ifFromOthers()
                .replyText("That's a long message, let me read it carefully...")
                .execute();

            // Example 3: Group Chat Handling
            await sdk
                .message(msg)
                .ifGroupChat() // Group chats only
                .when((m: Message) => m.text?.includes("@me")) // Mentioned
                .react("love") // Send love reaction
                .execute();

            // Example 4: Reply with Image
            await sdk
                .message(msg)
                .ifFromOthers()
                .when((m: Message) => m.text?.includes("image")) // Contains "image"
                .replyImage("/path/to/image.jpg")
                .execute();

            // Example 5: Chain Reactions
            await sdk
                .message(msg)
                .ifFromOthers()
                .when((m: Message) => m.text?.includes("like")) // Contains "like"
                .react("love") // Add love reaction
                .execute();

            // Example 6: Dynamic Replies
            await sdk
                .message(msg)
                .ifFromOthers()
                .when((m: Message) => m.text?.includes("random")) // Contains "random"
                .replyText((m: Message) => {
                    const responses = ["Okay!", "Got it!", "Understood!", "No problem!"];
                    const random = responses[Math.floor(Math.random() * responses.length)];
                    return `${random} (from: ${m.handle?.address})`;
                })
                .execute();
        },
    });

    // Listen for exit signal
    process.on("SIGINT", async () => {
        console.log("Message chain processing complete");
        await sdk.stopWatching();
        process.exit(0);
    });
}

main().catch(console.error);
