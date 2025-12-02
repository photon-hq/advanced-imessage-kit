import { createSDK, handleExit } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", () => {
        console.log("Auto-reply started");
    });

    sdk.on("new-message", async (message) => {
        console.log(`\nReceived: ${message.text || "(no text)"}`);
        console.log(`From: ${message.handle?.address || "unknown"}`);

        // Skip messages from self
        if (message.isFromMe) {
            return;
        }

        // Get chat guid from message
        const chat = message.chats?.[0];
        if (!chat) {
            return;
        }

        try {
            const originalText = message.text || message.attributedBody?.[0]?.string || "";
            const replyText = `Hey! ${originalText}`;

            const response = await sdk.messages.sendMessage({
                chatGuid: chat.guid,
                message: replyText,
            });

            console.log(`Replied: ${response.guid}`);
        } catch (error) {
            console.error("Failed to reply:", error);
        }
    });

    await sdk.connect();
    handleExit(sdk);
}

main().catch(console.error);
