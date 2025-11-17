/**
 * Example 1: Simple Message Sending
 *
 * Demonstrates how to send messages using the new concise API
 */

import { AdvancedIMessageKit } from "../index";

const CHAT_GUID = process.env.CHAT_GUID || "iMessage;-;+8618722049982";

async function main() {
    // Initialize SDK directly
    const sdk = new AdvancedIMessageKit({
        serverUrl: "https://ex7bmm.imsgd.photon.codes",
        logLevel: "info",
    });

    // Connect to server
    await sdk.connect();

    try {
        // Simple text send
        await sdk.send(CHAT_GUID, "Hello from Advanced iMessage Kit!");
        console.log("Message sent");

        // Send message with effect
        await sdk.send(CHAT_GUID, {
            text: "Happy Birthday!",
            effectId: "com.apple.messages.effect.Fireworks",
        });
        console.log("Message with effect sent");

        // Send file
        await sdk.sendFile(CHAT_GUID, "/path/to/document.pdf", "Here is a document");
        console.log("File sent");

        // Send multiple files
        await sdk.sendFiles(CHAT_GUID, ["/file1.pdf", "/file2.csv"], "Here are your files");
        console.log("Multiple files sent");
    } catch (error) {
        console.error("Send failed:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
