import { createSDK, handleError } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const contacts = await sdk.contacts.getContacts();

            const nameMap = new Map<string, string>();
            for (const c of contacts) {
                const name = c.displayName || c.firstName || "";
                if (!name) continue;
                for (const p of c.phoneNumbers || []) nameMap.set(p.address, name);
                for (const e of c.emails || []) nameMap.set(e.address, name);
            }

            const chats = await sdk.chats.getChats();
            const groups = chats.filter((chat) => chat.style === 43);
            console.log(`${groups.length} group chats\n`);

            groups.slice(0, 5).forEach((group, i) => {
                console.log(`${i + 1}. ${group.displayName || group.chatIdentifier}`);
                console.log(`   guid: ${group.guid}`);
                console.log(`   participants:`);
                group.participants?.forEach((p) => {
                    const name = nameMap.get(p.address);
                    const display = name ? `${name} <${p.address}>` : p.address;
                    console.log(`     - ${display} (${p.service})`);
                });
                console.log();
            });
        } catch (error) {
            handleError(error, "Failed to fetch chat participants");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
