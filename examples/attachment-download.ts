import fs from "node:fs";
import path from "node:path";
import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const OUTPUT_DIR = process.env.OUTPUT_DIR || "/tmp";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            // Get recent messages with attachments
            const messages = await sdk.messages.getMessages({
                chatGuid: CHAT_GUID,
                limit: 50,
                with: ["attachment"],
            });

            const messagesWithAttachments = messages.filter((m) => m.attachments && m.attachments.length > 0);

            if (messagesWithAttachments.length === 0) {
                console.log("No messages with attachments found");
                await sdk.close();
                process.exit(0);
            }

            console.log(`Found ${messagesWithAttachments.length} messages with attachments\n`);

            // Download the first attachment
            const firstMsg = messagesWithAttachments[0];
            const attachment = firstMsg?.attachments?.[0];

            if (!attachment) {
                console.log("No attachment found");
                await sdk.close();
                process.exit(0);
            }

            console.log(`Attachment: ${attachment.transferName}`);
            console.log(`Type: ${attachment.mimeType || "unknown"}`);
            console.log(`Size: ${(attachment.totalBytes / 1024).toFixed(2)} KB`);
            console.log(`GUID: ${attachment.guid}\n`);

            // Get attachment info
            const info = await sdk.attachments.getAttachment(attachment.guid);
            console.log(`Info retrieved: ${info.transferName}`);

            // Download attachment
            console.log("Downloading...");
            const buffer = await sdk.attachments.downloadAttachment(attachment.guid, {
                original: true,
            });

            const outputPath = path.join(OUTPUT_DIR, attachment.transferName);
            fs.writeFileSync(outputPath, buffer);
            console.log(`Saved to: ${outputPath}`);

            // Get blurhash if it's an image
            if (attachment.mimeType?.startsWith("image/")) {
                try {
                    const blurhash = await sdk.attachments.getAttachmentBlurhash(attachment.guid);
                    console.log(`Blurhash: ${blurhash}`);
                } catch {
                    console.log("Blurhash not available");
                }
            }

            // Check for Live Photo
            if (attachment.hasLivePhoto) {
                console.log("\nDownloading Live Photo video...");
                const liveBuffer = await sdk.attachments.downloadAttachmentLive(attachment.guid);
                const livePath = path.join(OUTPUT_DIR, `${path.parse(attachment.transferName).name}_live.mov`);
                fs.writeFileSync(livePath, liveBuffer);
                console.log(`Live Photo saved to: ${livePath}`);
            }

            // Get total attachment count
            const totalCount = await sdk.attachments.getAttachmentCount();
            console.log(`\nTotal attachments in database: ${totalCount}`);
        } catch (error) {
            handleError(error, "Failed to download attachment");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
