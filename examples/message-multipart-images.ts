import fs from "node:fs";
import path from "node:path";
import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID;
const IMAGE_PATHS = (process.env.IMAGE_PATHS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const DEFAULT_IMAGE_PATHS = [path.join(__dirname, "test-image.png"), path.join(__dirname, "test-image.png")];

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        if (!CHAT_GUID) {
            console.error("CHAT_GUID is required and should be an existing chat GUID for multipart sends");
            await sdk.close();
            process.exit(1);
        }

        const imagePaths = IMAGE_PATHS.length > 0 ? IMAGE_PATHS : DEFAULT_IMAGE_PATHS;

        const missing = imagePaths.filter((filePath) => !fs.existsSync(filePath));
        if (missing.length > 0) {
            console.error("missing files:");
            for (const filePath of missing) {
                console.error(`- ${filePath}`);
            }
            await sdk.close();
            process.exit(1);
        }

        try {
            const message = await sdk.messages.sendMultipartMessage({
                chatGuid: CHAT_GUID,
                parts: imagePaths.map((filePath, index) => ({
                    partIndex: index,
                    filePath,
                    fileName: path.basename(filePath),
                })),
            });

            const sentMessage = await sdk.messages.getMessage(message.guid, {
                with: ["attachments"],
            });

            console.log(`sent multipart message: ${message.guid}`);
            console.log(`attachments: ${sentMessage.attachments?.length ?? 0}`);
            console.log(`${new Date(message.dateCreated).toLocaleString()}`);
        } catch (error) {
            handleError(error, "Failed to send multipart images");
            await sdk.close();
            process.exit(1);
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch((error) => {
    handleError(error, "Failed to start multipart image example");
    process.exit(1);
});
