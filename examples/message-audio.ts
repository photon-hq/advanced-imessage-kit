import path from "node:path";
import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const AUDIO_FILE_PATH = process.env.AUDIO_FILE_PATH || path.join(__dirname, "test-audio.mp3");

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const message = await sdk.attachments.sendAttachment({
                chatGuid: CHAT_GUID,
                filePath: AUDIO_FILE_PATH,
                isAudioMessage: true,
            });

            console.log(`sent: ${message.guid}`);
            console.log(`${new Date(message.dateCreated).toLocaleString()}`);
        } catch (error) {
            handleError(error, "Failed to send audio message");
        }

        await sdk.disconnect();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
