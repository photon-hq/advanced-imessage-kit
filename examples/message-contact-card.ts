import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";
const CONTACT_ADDRESS = process.env.CONTACT_ADDRESS;
const FORCE = process.env.FORCE === "1";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            if (CONTACT_ADDRESS) {
                const contactCard = await sdk.contacts.getContactCard(CONTACT_ADDRESS);

                console.log(`${contactCard.firstName || ""} ${contactCard.lastName || ""}`);
                console.log(`${contactCard.emails?.[0] || "no email"}`);
                console.log(`${contactCard.phones?.[0] || "no phone"}`);
            }

            if (CHAT_GUID) {
                console.log(`Sharing contact card to chat: ${CHAT_GUID}`);

                // Check if sharing is recommended (optional)
                const shouldShare = await sdk.contacts.shouldShareContact(CHAT_GUID);
                console.log(`Should share contact: ${shouldShare}`);

                if (!shouldShare && !FORCE) {
                    console.log("Contact sharing is not recommended for this chat");
                    console.log("(You may have already shared, or the recipient hasn't shared theirs)");
                    console.log("Use FORCE=1 to share anyway");
                } else {
                    await sdk.contacts.shareContactCard(CHAT_GUID);
                    console.log("✓ Contact card shared successfully!");
                }
            }
        } catch (error) {
            handleError(error, "Failed to share contact card");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
