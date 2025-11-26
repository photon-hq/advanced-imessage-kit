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

        await sdk.close();
        process.exit(0);
    });

    sdk.on("new-findmy-location", (data) => {
        const handle = data.handle || "Unknown";
        const [latitude, longitude] = data.coordinates;
        const address = data.short_address || data.long_address || "No address";

        console.log(`\nUpdate for ${handle}`);
        console.log(`  Location: ${latitude}, ${longitude}`);
        console.log(`  Address: ${address}`);
        console.log(`  Status: ${data.status}`);
    });

    await sdk.connect();
}

main().catch(console.error);
