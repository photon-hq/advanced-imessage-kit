/**
 * Example: Send Attachment
 * Demonstrates how to send files and images
 */

import fs from "node:fs";
import path from "node:path";
import { AdvancedIMessageKit } from "../index";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const ATTACHMENT_PATH = process.env.ATTACHMENT_PATH || path.join(__dirname, "test-image.jpg");

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    if (!fs.existsSync(ATTACHMENT_PATH)) {
        console.error(`File not found: ${ATTACHMENT_PATH}`);
        process.exit(1);
    }

    const fileName = path.basename(ATTACHMENT_PATH);
    const fileSize = (fs.statSync(ATTACHMENT_PATH).size / 1024).toFixed(2);
    console.log(`Sending file: ${fileName} (${fileSize} KB)`);

    try {
        await sdk.sendFile(CHAT_GUID, ATTACHMENT_PATH, `Sending you ${fileName}`);
        console.log("Attachment sent successfully");
    } catch (error) {
        console.error("Failed to send attachment:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
