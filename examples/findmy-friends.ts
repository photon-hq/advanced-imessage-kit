import type { FindMyLocationItem } from "../types/findmy";
import { createSDK } from "./utils";

const TARGET_HANDLE = process.env.TARGET_HANDLE || "+1234567890";

function formatLocation(loc: FindMyLocationItem, indent = ""): string {
    const lines = [
        `${indent}Coordinates: ${loc.coordinates[0]}, ${loc.coordinates[1]}`,
        `${indent}Maps: https://maps.google.com/?q=${loc.coordinates[0]},${loc.coordinates[1]}`,
    ];
    if (loc.long_address) lines.push(`${indent}Address: ${loc.long_address}`);
    if (loc.expiry) {
        const remaining = Math.floor((loc.expiry - Date.now()) / 60000);
        lines.push(`${indent}Expires in: ${remaining} minutes`);
    }
    return lines.join("\n");
}

async function main() {
    const sdk = createSDK();
    await sdk.connect();

    const locations = await sdk.icloud.refreshFindMyFriends();

    // Check target handle
    const target = locations.find((l) => l.handle === TARGET_HANDLE);
    console.log(`\nTarget: ${TARGET_HANDLE}\n`);
    if (target) {
        console.log(formatLocation(target, "  "));
    } else {
        console.log("  Not sharing location");
    }

    // List all friends
    console.log(`\nAll Friends (${locations.length}):`);
    for (const loc of locations) {
        console.log(`\n  ${loc.handle}`);
        console.log(formatLocation(loc, "    "));
    }

    process.exit(0);
}

main().catch(console.error);
