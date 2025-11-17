/**
 * Example: Auto-Reply with "Hey!"
 * Automatically replies with "Hey!" + original message when receiving messages
 */

import { AdvancedIMessageKit } from "../index";

async function main() {
    console.log('Auto-reply Test - Reply with "Hey!" + original message');
    console.log("Server: http://localhost:1234");
    console.log("=".repeat(50));

    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    console.log("Starting connection...");
    await sdk.connect();
    console.log("Connected! Auto-reply function started!\n");

    await sdk.startWatching({
        onNewMessage: async (message) => {
            console.log("Received new message:");
            console.log("  Sender:", message.handle?.address || "Unknown");
            console.log("  Content:", message.text || "No text");
            console.log("  GUID:", message.guid);
            console.log("  From me:", message.isFromMe);

            // If the message is not from me, send an auto-reply
            if (!message.isFromMe && message.chats && message.chats.length > 0) {
                const chatGuid = message.chats[0]!.guid;
                console.log("Preparing to send auto-reply to chat:", chatGuid);

                try {
                    // Get original message content
                    const originalMessage = message.text || "No text";

                    // Send auto-reply: Hey! + original message
                    const replyMessage = `Hey! ${originalMessage}`;

                    await sdk.send(chatGuid, replyMessage);
                    console.log("Auto-reply sent successfully\n");
                } catch (error) {
                    console.error("Auto-reply failed to send:", error);
                }
            } else if (message.isFromMe) {
                console.log("Skipping message sent by me\n");
            }
        },
        onError: (error) => {
            console.error("Error:", error);
        },
    });

    // Keep connection alive
    process.on("SIGINT", async () => {
        console.log("\nDisconnecting...");
        await sdk.close();
        process.exit(0);
    });
}

main().catch(console.error);
