import { createSDK, handleError } from "./utils";

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        try {
            const friends = await sdk.icloud.getFindMyFriends();

            if (friends?.length) {
                console.log(`${friends.length} friends\n`);

                friends.forEach((friend, i) => {
                    console.log(`${i + 1}. ${friend.name || "unknown"} (${friend.id})`);
                    if (friend.location) {
                        const { latitude, longitude, horizontalAccuracy, timestamp } = friend.location;
                        console.log(`   ${latitude}, ${longitude} (${horizontalAccuracy || "?"}m)`);
                        if (timestamp) {
                            console.log(`   ${new Date(timestamp).toLocaleString()}`);
                        }
                    } else {
                        console.log("   no location");
                    }
                    console.log();
                });
            } else {
                console.log("no friends\n");
            }

            const devices = await sdk.icloud.getFindMyDevices();

            if (devices?.length) {
                console.log(`${devices.length} devices\n`);

                devices.forEach((device, i) => {
                    console.log(`${i + 1}. ${device.name || "unknown"}`);
                    console.log(`   ${device.deviceModel || "unknown"}`);

                    if (device.location) {
                        const { latitude, longitude, horizontalAccuracy } = device.location;
                        console.log(`   ${latitude}, ${longitude} (${horizontalAccuracy || "?"}m)`);
                    }

                    if (device.batteryLevel != null) {
                        console.log(`   ${(device.batteryLevel * 100).toFixed(0)}% battery`);
                    }
                    console.log();
                });
            } else {
                console.log("no devices\n");
            }
        } catch (error) {
            handleError(error, "Failed to fetch Find My data");
        }

        await sdk.disconnect();
        process.exit(0);
    });

    sdk.on("findmy-location-update", (data: unknown) => {
        const { name, friendId, location } = data as {
            name?: string;
            friendId?: string;
            location?: { latitude?: number; longitude?: number };
        };
        console.log(`\n${name || friendId}`);
        if (location) {
            console.log(`  ${location.latitude}, ${location.longitude}`);
        }
    });

    await sdk.connect();
}

main().catch(console.error);
