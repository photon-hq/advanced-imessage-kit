import { createSDK, handleError } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const contacts = await sdk.contacts.getContacts();
            console.log(`${contacts.length} contacts\n`);

            contacts.slice(0, 10).forEach((contact, i) => {
                const name = contact.displayName || contact.firstName || "unknown";
                console.log(`${i + 1}. ${name}`);

                contact.phoneNumbers?.forEach((phone: any) => {
                    console.log(`   ${phone.address}`);
                });
                contact.emails?.forEach((email: any) => {
                    console.log(`   ${email.address}`);
                });
                console.log();
            });
        } catch (error) {
            handleError(error, "Failed to fetch contacts");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
