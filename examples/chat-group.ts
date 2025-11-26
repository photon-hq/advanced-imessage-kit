import { createSDK, handleError, handleExit } from "./utils";

async function main() {
    const sdk = createSDK();

    const logEvent = (eventName: string, data: any) => {
        const chatName = data?.displayName || data?.guid || "Unknown";
        console.log(`\n${eventName}: ${chatName}`);
        if (data?.groupTitle) {
            console.log(`  name changed to: ${data.groupTitle}`);
        }
    };

    sdk.on("group-name-change", (data) => logEvent("name change", data));
    sdk.on("participant-added", (data) => logEvent("added", data));
    sdk.on("participant-removed", (data) => logEvent("removed", data));
    sdk.on("participant-left", (data) => logEvent("left", data));
    sdk.on("group-icon-changed", (data) => logEvent("icon changed", data));
    sdk.on("group-icon-removed", (data) => logEvent("icon removed", data));

    sdk.on("ready", async () => {
        try {
            const allChats = await sdk.chats.getChats();

            // list all group chats
            // style 43 = group chat, style 45 = 1-on-1 chat
            const groups = allChats.filter((chat) => "style" in chat && chat.style === 43);

            console.log(`got ${groups.length} groups\n`);

            groups.forEach((group, i) => {
                console.log(`${i + 1}. ${group.displayName || group.chatIdentifier}`);
                console.log(`   guid: ${group.guid}`);
                console.log(`   people: ${group.participants?.length || 0}`);

                if (group.participants?.length) {
                    group.participants.slice(0, 3).forEach((p) => {
                        console.log(`     ${p.address}`);
                    });
                    if (group.participants.length > 3) {
                        console.log(`     ... and ${group.participants.length - 3} more`);
                    }
                }
                console.log();
            });

            console.log("\nwatching for group changes...");
        } catch (error) {
            handleError(error, "Failed to fetch groups");
        }
    });

    await sdk.connect();
    handleExit(sdk);
}

main().catch(console.error);
