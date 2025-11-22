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
            const groups = await sdk.listChats({ type: "group" });

            console.log(`got ${groups.length} groups\n`);

            groups.forEach((group, i) => {
                const participants = group.rawChat.participants?.length || 0;
                console.log(`${i + 1}. ${group.displayName || group.chatGuid}`);
                console.log(`   guid: ${group.chatGuid}`);
                console.log(`   people: ${participants}`);

                if (group.rawChat.participants?.length) {
                    group.rawChat.participants.slice(0, 3).forEach((p) => {
                        console.log(`     ${p.address}`);
                    });
                    if (group.rawChat.participants.length > 3) {
                        console.log(`     ... and ${group.rawChat.participants.length - 3} more`);
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
