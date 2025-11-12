import { SDK } from "../index";

async function autoReplyHeyTest() {
    console.log('🤖 Auto-reply Test - Reply with "Hey!" + original message when receiving a message');
    console.log("Server: https://u1.imsgd.photon.codes");
    console.log("=".repeat(50));

    const sdk = SDK({
        serverUrl: "https://u1.imsgd.photon.codes",
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

    sdk.on("new-message", async (message: any) => {
        console.log("📨 Received new message:");
        console.log("  Sender:", message.handle?.address || "Unknown");
        console.log("  Content:", message.text || message.attributedBody || "No text");
        console.log("  GUID:", message.guid);
        console.log("  From me:", message.isFromMe);

        // If the message is not from me, send an auto-reply
        if (!message.isFromMe && message.chats && message.chats.length > 0) {
            const chatGuid = message.chats[0].guid;
            console.log("🤖 Preparing to send auto-reply to chat:", chatGuid);

            try {
                // Get original message content
                const originalMessage = message.text || message.attributedBody?.[0]?.string || "No text";

                // Send auto-reply: Hey! + original message
                const replyMessage = `Hey！${originalMessage}`;

                const response = await sdk.messages.sendMessage({
                    chatGuid: chatGuid,
                    message: replyMessage,
                });

                console.log("✅ Auto-reply sent successfully:", response);
            } catch (error) {
                console.error("❌ Auto-reply failed to send:", error);
            }
        } else if (message.isFromMe) {
            console.log("⏭️  Skipping message sent by me");
        }
    });

    console.log("🚀 Starting connection...");
    await sdk.connect();

    // Keep connection alive
    process.on("SIGINT", () => {
        console.log("\n👋 Disconnecting...");
        console.log(`📊 Processed message count: ${sdk.getProcessedMessageCount()}`);
        sdk.disconnect();
        process.exit(0);
    });
}

autoReplyHeyTest().catch(console.error);
