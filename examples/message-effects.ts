/**
 * Example: Message Effects
 * Demonstrates how to send messages with visual effects (requires Private API)
 */

import { AdvancedIMessageKit } from "../index";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+1234567890";

const MESSAGE_EFFECTS = {
    confetti: "com.apple.messages.effect.CKConfettiEffect",
    lasers: "com.apple.messages.effect.CKHappyBirthdayEffect",
    fireworks: "com.apple.messages.effect.CKFireworksEffect",
    balloons: "com.apple.messages.effect.CKBalloonEffect",
    hearts: "com.apple.messages.effect.CKHeartEffect",
    shootingStar: "com.apple.messages.effect.CKShootingStarEffect",
    celebration: "com.apple.messages.effect.CKSparklesEffect",
    echo: "com.apple.messages.effect.CKEchoEffect",
    spotlight: "com.apple.messages.effect.CKSpotlightEffect",
    gentle: "com.apple.MobileSMS.expressivesend.gentle",
    loud: "com.apple.MobileSMS.expressivesend.loud",
    slam: "com.apple.MobileSMS.expressivesend.impact",
    invisible_ink: "com.apple.MobileSMS.expressivesend.invisibleink",
} as const;

async function main() {
    const sdk = new AdvancedIMessageKit({
        serverUrl: "http://localhost:1234",
        logLevel: "info",
    });

    await sdk.connect();

    console.log("Message effects example\n");
    console.log("Note: Effects require Private API to be enabled\n");

    try {
        console.log("Sending message with confetti effect");
        await sdk.send(CHAT_GUID, {
            text: "Happy Birthday!",
            effectId: MESSAGE_EFFECTS.confetti,
        });
        console.log("Confetti message sent\n");

        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Sending message with fireworks effect");
        await sdk.send(CHAT_GUID, {
            text: "Celebration time!",
            effectId: MESSAGE_EFFECTS.fireworks,
        });
        console.log("Fireworks message sent\n");

        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Sending message with balloons effect");
        await sdk.send(CHAT_GUID, {
            text: "Congratulations!",
            effectId: MESSAGE_EFFECTS.balloons,
        });
        console.log("Balloons message sent\n");

        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Sending message with invisible ink effect");
        await sdk.send(CHAT_GUID, {
            text: "Secret message!",
            effectId: MESSAGE_EFFECTS.invisible_ink,
        });
        console.log("Invisible ink message sent\n");

        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Sending message with loud/slam effect");
        await sdk.send(CHAT_GUID, {
            text: "IMPORTANT MESSAGE!",
            effectId: MESSAGE_EFFECTS.loud,
        });
        console.log("Loud message sent\n");

        console.log("All effects demonstrated! Available effects:");
        console.log(JSON.stringify(MESSAGE_EFFECTS, null, 2));
    } catch (error) {
        console.error("Failed to send message with effect:", error);
        console.log("\nMake sure Private API is enabled on the server to use effects!");
    } finally {
        await sdk.close();
    }
}

main().catch(console.error);
