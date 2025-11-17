/**
 * Send to existing contact
 */

import { AdvancedIMessageKit } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "https://ex7bmm.imsgd.photon.codes",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        // Send to existing contact
        const chatGuid = "any;-;+13322593374";
        await sdk.send(chatGuid, "Test message from API - working!");
        console.log("✓ Message sent successfully to +13322593374!");
    } catch (error) {
        console.error("✗ Failed:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
