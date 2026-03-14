import type { BubbleEffect } from "../types";
import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

const BUBBLE_EFFECTS: BubbleEffect[] = [
    "confetti",
    "lasers",
    "fireworks",
    "balloons",
    "hearts",
    "shootingStar",
    "celebration",
    "echo",
    "spotlight",
    "gentle",
    "loud",
    "slam",
    "invisibleInk",
];

const EFFECT_MESSAGES: Record<BubbleEffect, string> = {
    confetti: "Happy Birthday!",
    lasers: "Pew pew pew!",
    fireworks: "Celebration time!",
    balloons: "Congratulations!",
    hearts: "I love you!",
    shootingStar: "Make a wish!",
    celebration: "Amazing!",
    echo: "Hello hello hello...",
    spotlight: "Look at me!",
    gentle: "Shh...",
    loud: "IMPORTANT MESSAGE!",
    slam: "BAM!",
    invisibleInk: "Secret message!",
};

async function main() {
    const sdk = createSDK();

    sdk.on("ready", async () => {
        console.log("Bubble effect examples (requires Private API)\n");

        try {
            for (const effect of BUBBLE_EFFECTS) {
                const msg = await sdk.messages.sendMessage({
                    chatGuid: CHAT_GUID,
                    message: EFFECT_MESSAGES[effect],
                    bubbleEffect: effect,
                });
                console.log(`${effect}: ${msg.guid}`);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }

            console.log("\nAvailable bubble effects:");
            for (const effect of BUBBLE_EFFECTS) {
                console.log(`  ${effect}`);
            }
        } catch (error) {
            handleError(error, "Failed to send message with effect");
            console.log("\nNote: Bubble effects require Private API to be enabled");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
