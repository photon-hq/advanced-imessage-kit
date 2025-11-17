/**
 * Example: Send Audio Message
 * Demonstrates how to send audio files
 */

import path from "node:path";
import { AdvancedIMessageKit } from "../index";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const AUDIO_FILE_PATH = process.env.AUDIO_FILE_PATH || path.join(__dirname, "test-audio.mp3");

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        console.log(`Sending audio: ${AUDIO_FILE_PATH}`);
        await sdk.sendFile(CHAT_GUID, AUDIO_FILE_PATH, "Audio message");
        console.log("Audio message sent successfully");
    } catch (error) {
        console.error("Failed to send audio:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
