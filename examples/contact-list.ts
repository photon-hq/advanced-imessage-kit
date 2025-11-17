/**
 * Example: List Contacts
 * Demonstrates how to fetch and display contacts
 */

import { AdvancedIMessageKit } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        const contacts = await sdk.getContacts();
        console.log(`Found ${contacts.length} contacts\n`);

        contacts.slice(0, 10).forEach((contact, i) => {
            const name = contact.displayName || contact.firstName || "Unknown";
            console.log(`${i + 1}. ${name}`);

            contact.phoneNumbers?.forEach((phone: any) => {
                console.log(`   Phone: ${phone.address}`);
            });
            contact.emails?.forEach((email: any) => {
                console.log(`   Email: ${email.address}`);
            });
            console.log();
        });
    } catch (error) {
        console.error("Failed to fetch contacts:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
