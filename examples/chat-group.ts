/**
 * Example: Group Chat Management
 * Demonstrates how to list and monitor group chats
 */

import { AdvancedIMessageKit } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        // Fetch all chats and filter for groups
        const allChats = await sdk.listChats();
        const groups = allChats.filter((chat) => "style" in chat && chat.style === 43);

        console.log(`Found ${groups.length} groups\n`);

        groups.forEach((group, i) => {
            console.log(`${i + 1}. ${group.displayName || group.chatIdentifier}`);
            console.log(`   GUID: ${group.guid}`);
            console.log(`   Participants: ${group.participants?.length || 0}`);

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

        console.log("Watching for group changes...\n");

        // Watch for group events
        const logEvent = (eventName: string, data: any) => {
            const chatName = data?.displayName || data?.guid || "Unknown";
            console.log(`${eventName}: ${chatName}`);
            if (data?.groupTitle) {
                console.log(`  Name changed to: ${data.groupTitle}`);
            }
        };

        sdk.on("group-name-change", (data) => logEvent("Group name changed", data));
        sdk.on("participant-added", (data) => logEvent("Participant added", data));
        sdk.on("participant-removed", (data) => logEvent("Participant removed", data));
        sdk.on("participant-left", (data) => logEvent("Participant left", data));
        sdk.on("group-icon-changed", (data) => logEvent("Group icon changed", data));
        sdk.on("group-icon-removed", (data) => logEvent("Group icon removed", data));
    } catch (error) {
        console.error("Failed to fetch groups:", error);
    }

    // Handle exit
    process.on("SIGINT", async () => {
        console.log("\nShutting down...");
        await sdk.close();
        process.exit(0);
    });
}

main().catch(console.error);
