/**
 * Example: Share Contact Card
 * Demonstrates how to retrieve and share contact information
 */

import { AdvancedIMessageKit } from "../index";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const CONTACT_NAME = process.env.CONTACT_NAME || "";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        // List contacts
        const contacts = await sdk.getContacts();
        console.log(`Found ${contacts.length} contacts\n`);

        // Show first contact as example
        if (contacts.length > 0) {
            const contact = contacts[0];
            console.log(`Example contact: ${contact.displayName || contact.firstName || "Unknown"}`);
            if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                console.log(`  Phone: ${contact.phoneNumbers[0].address || "N/A"}`);
            }
            if (contact.emails && contact.emails.length > 0) {
                console.log(`  Email: ${contact.emails[0].address || "N/A"}`);
            }
        }

        console.log("\nNote: Contact sharing requires advanced API methods");
    } catch (error) {
        console.error("Failed to retrieve contacts:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
