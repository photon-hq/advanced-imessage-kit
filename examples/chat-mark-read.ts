import { createSDK, handleError, handleExit } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", () => {
        console.log("ready, waiting for messages...\n");
    });

    sdk.on("new-message", async (message) => {
        // Skip messages from self
        if (message.isFromMe) return;

        const sender = message.handle?.address ?? "unknown";
        const text = message.text ?? "(no text)";
        const messageGuid = message.guid;

        console.log(`\n--- New Message ---`);
        console.log(`from: ${sender}`);
        console.log(`text: ${text}`);
        console.log(`message guid: ${messageGuid}`);

        // Get chat GUID from message
        const chatGuid = message.chats?.[0]?.guid;
        if (!chatGuid) {
            console.log("no chat guid found, skipping mark read");
            return;
        }

        console.log(`chat guid: ${chatGuid}`);

        try {
            // Mark the chat as read
            await sdk.chats.markChatRead(chatGuid);
            console.log(`✓ marked as read`);
        } catch (error) {
            handleError(error, "failed to mark as read");
        }
    });

    sdk.on("error", (error) => {
        console.error("error:", error.message);
    });

    await sdk.connect();
    handleExit(sdk);
}

main().catch(console.error);
