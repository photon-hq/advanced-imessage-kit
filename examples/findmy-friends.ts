/**
 * Example: Find My Friends
 * Demonstrates how to retrieve Find My Friends and Devices data (requires private API)
 */

import { AdvancedIMessageKit } from "../index";

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    try {
        const friends = await sdk.getFindMyFriends();

        if (friends?.length) {
            console.log(`Found ${friends.length} friends\n`);

            friends.forEach((friend, i) => {
                console.log(`${i + 1}. ${friend.name || "Unknown"} (${friend.id})`);
                if (friend.location) {
                    const { latitude, longitude, horizontalAccuracy, timestamp } = friend.location;
                    console.log(`   Location: ${latitude}, ${longitude}`);
                    console.log(`   Accuracy: ${horizontalAccuracy || "Unknown"}m`);
                    if (timestamp) {
                        console.log(`   Updated: ${new Date(timestamp).toLocaleString()}`);
                    }
                } else {
                    console.log("   No location available");
                }
                console.log();
            });
        } else {
            console.log("No friends found\n");
        }

        const devices = await sdk.getFindMyDevices();

        if (devices?.length) {
            console.log(`Found ${devices.length} devices\n`);

            devices.forEach((device, i) => {
                console.log(`${i + 1}. ${device.name || "Unknown"}`);
                console.log(`   Model: ${device.deviceModel || "Unknown"}`);
                if (device.location) {
                    const { latitude, longitude } = device.location;
                    console.log(`   Location: ${latitude}, ${longitude}`);
                }
                console.log();
            });
        } else {
            console.log("No devices found\n");
        }
    } catch (error) {
        console.error("Failed to fetch Find My data:", error);
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
