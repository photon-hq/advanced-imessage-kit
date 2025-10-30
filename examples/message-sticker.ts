import path from "node:path";
import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const STICKER_PATH = process.env.STICKER_PATH || path.join(__dirname, "test-image.jpg");

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const textMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Here comes a sticker! 👇",
            });

            console.log(`sent: ${textMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            const stickerMessage = await sdk.attachments.sendSticker({
                chatGuid: CHAT_GUID,
                filePath: STICKER_PATH,
                selectedMessageGuid: textMessage.guid,
            });

            console.log(`sticker: ${stickerMessage.guid}`);
        } catch (error) {
            handleError(error, "Failed to send sticker");
        }

        await sdk.disconnect();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
