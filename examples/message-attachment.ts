import fs from "node:fs";
import path from "node:path";
import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const ATTACHMENT_PATH = process.env.ATTACHMENT_PATH || path.join(__dirname, "test-image.jpg");

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        if (!fs.existsSync(ATTACHMENT_PATH)) {
            console.error(`file not found: ${ATTACHMENT_PATH}`);
            await sdk.disconnect();
            process.exit(1);
        }

        const fileName = path.basename(ATTACHMENT_PATH);
        const fileSize = (fs.statSync(ATTACHMENT_PATH).size / 1024).toFixed(2);
        console.log(`sending ${fileName} (${fileSize} KB)`);

        try {
            const message = await sdk.attachments.sendAttachment({
                chatGuid: CHAT_GUID,
                filePath: ATTACHMENT_PATH,
            });

            console.log(`sent: ${message.guid}`);
            if (message.attachments && message.attachments.length > 0) {
                const att = message.attachments[0];
                console.log(`${att.transferName} (${att.mimeType || "unknown"})`);
            }
        } catch (error) {
            handleError(error, "Failed to send attachment");
        }

        await sdk.disconnect();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
