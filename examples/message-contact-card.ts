import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "";
const CONTACT_ADDRESS = process.env.CONTACT_ADDRESS;

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
                await sdk.contacts.shareContactCard(CHAT_GUID);
                console.log("shared contact card");
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
