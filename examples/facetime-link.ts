/**
 * Example: FaceTime Links
 * Demonstrates how to create FaceTime links (requires private API)
 */

import { AdvancedIMessageKit } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        console.log("Creating FaceTime link...");
        const link = await sdk.createFaceTimeLink();
        console.log(`FaceTime link: ${link}`);
    } catch (error) {
        console.error("Failed to create FaceTime link:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
