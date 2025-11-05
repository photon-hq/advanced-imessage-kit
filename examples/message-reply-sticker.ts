import path from "node:path";
import type { AttachmentResponse } from "../types";
import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+16504444652";
const STICKER_PATH = process.env.STICKER_PATH || path.join(__dirname, "test-image.jpg");

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        console.log("Sticker message example...\n");

        try {
            console.log("Sending a text message first...");
            const textMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Here comes a sticker! 👇",
            });

            console.log(`✓ Text message sent! GUID: ${textMessage.guid}`);
            console.log(`Text: "${textMessage.text}"\n`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log(`Sending sticker as a reply to the previous message...`);
            const stickerMessage = await sdk.attachments.sendSticker({
                chatGuid: CHAT_GUID,
                filePath: STICKER_PATH,
                selectedMessageGuid: textMessage.guid, // Attach sticker to the text message
            });

            console.log("\n✓ Sticker sent successfully!");
            console.log(`Sticker message GUID: ${stickerMessage.guid}`);
            console.log(`Attachments: ${stickerMessage.attachments?.length || 0}`);
            if (stickerMessage.attachments?.[0]) {
                const attachment = stickerMessage.attachments[0] as AttachmentResponse;
                console.log(`Attachment type: ${attachment.mimeType || "unknown"}`);
                console.log(`Is sticker: ${attachment.isSticker || false}`);
            }
        } catch (error) {
            handleError(error, "Failed to send sticker");
        }

        await sdk.disconnect();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
