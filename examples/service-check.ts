/**
 * Example: Service Availability Check
 * Demonstrates how to check iMessage and FaceTime availability (requires private API)
 */

import { AdvancedIMessageKit } from "../index";

const CONTACTS_TO_CHECK = [process.env.PHONE_NUMBER || "+1234567890"];

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        for (const contact of CONTACTS_TO_CHECK) {
            console.log(`Checking availability for: ${contact}`);

            const hasIMessage = await sdk.checkHandleAvailability(contact, "imessage");
            const hasFaceTime = await sdk.checkHandleAvailability(contact, "facetime");

            const chatGuid = hasIMessage ? `iMessage;-;${contact}` : `SMS;-;${contact}`;

            console.log(`  iMessage: ${hasIMessage ? "Yes" : "No"}`);
            console.log(`  FaceTime: ${hasFaceTime ? "Yes" : "No"}`);
            console.log(`  CHAT_GUID: ${chatGuid}`);
            console.log(`  Service: ${hasIMessage ? "iMessage" : "SMS"}\n`);
        }
    } catch (error) {
        console.error("Failed to check availability:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
