import type { Message } from "../index";
import { createSDK, handleError } from "./utils";

async function autoReplyHeyTest() {
    console.log('🤖 Auto-reply Test - Reply with "Hey!" + original message when receiving a message');
    console.log("Server: https://example.imsgd.photon.codes");
    console.log("=".repeat(50));

    const sdk = createSDK({
        serverUrl: "https://example.imsgd.photon.codes",
        logLevel: "info",
    });

    // Register event listeners
    sdk.on("connect", () => {
        console.log("✅ [SDK] Socket.IO connected successfully");
    });

    sdk.on("disconnect", () => {
        console.log("❌ [SDK] Socket.IO disconnected");
    });

    sdk.on("error", (error: any) => {
        console.log("🚨 [SDK] Error:", error);
    });

    sdk.on("ready", () => {
        console.log("✅ SDK ready, auto-reply function started!");
    });

    sdk.on("new-message", async (message: Message) => {
        console.log("📨 Received new message:");
        console.log("  Sender:", message.handle?.address || "Unknown");
        console.log("  Content:", message.text || "No text");
        console.log("  GUID:", message.guid);
        console.log("  From me:", message.isFromMe);

        // If the message is not from me, send an auto-reply
        const firstChat = Array.isArray(message.chats) ? message.chats[0] : undefined;
        if (!message.isFromMe && firstChat?.guid) {
            const chatGuid = firstChat.guid;
            console.log("Preparing to send auto-reply to chat:", chatGuid);

            try {
                const originalMessage = message.text || "No text";

                // Send auto-reply: "Hey!" + original message
                const replyMessage = `Hey! ${originalMessage}`;

                const result = await sdk.send(chatGuid, replyMessage);

                console.log("✅ Auto-reply sent successfully at:", result.sentAt.toLocaleString());
            } catch (error) {
                handleError(error, "Auto-reply failed to send");
            }
        } else if (message.isFromMe) {
            console.log("⏭️  Skipping message sent by me");
        }
    });

    console.log("🚀 Starting connection...");
    await sdk.connect();

    // Keep connection alive
    process.on("SIGINT", async () => {
        console.log("\n👋 Disconnecting...");
        await sdk.close();
        process.exit(0);
    });
}

autoReplyHeyTest().catch(console.error);
