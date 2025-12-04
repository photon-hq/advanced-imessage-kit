import { createSDK, handleError } from "./utils";

const CHAT_GUID = process.env.CHAT_GUID || "any;-;+13322593374";

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
    const sdk = createSDK();

    sdk.on("ready", async () => {
        console.log("Message effects example (requires Private API)\n");

        try {
            // Confetti effect
            const confettiMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Happy Birthday!",
                effectId: MESSAGE_EFFECTS.confetti,
            });
            console.log(`confetti: ${confettiMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Lasers effect
            const lasersMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Pew pew pew!",
                effectId: MESSAGE_EFFECTS.lasers,
            });
            console.log(`lasers: ${lasersMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Fireworks effect
            const fireworksMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Celebration time!",
                effectId: MESSAGE_EFFECTS.fireworks,
            });
            console.log(`fireworks: ${fireworksMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Balloons effect
            const balloonsMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Congratulations!",
                effectId: MESSAGE_EFFECTS.balloons,
            });
            console.log(`balloons: ${balloonsMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Hearts effect
            const heartsMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "I love you!",
                effectId: MESSAGE_EFFECTS.hearts,
            });
            console.log(`hearts: ${heartsMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Shooting star effect
            const shootingStarMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Make a wish!",
                effectId: MESSAGE_EFFECTS.shootingStar,
            });
            console.log(`shootingStar: ${shootingStarMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Celebration effect
            const celebrationMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Amazing!",
                effectId: MESSAGE_EFFECTS.celebration,
            });
            console.log(`celebration: ${celebrationMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Echo effect
            const echoMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Hello hello hello...",
                effectId: MESSAGE_EFFECTS.echo,
            });
            console.log(`echo: ${echoMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Spotlight effect
            const spotlightMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Look at me!",
                effectId: MESSAGE_EFFECTS.spotlight,
            });
            console.log(`spotlight: ${spotlightMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Gentle effect
            const gentleMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Shh...",
                effectId: MESSAGE_EFFECTS.gentle,
            });
            console.log(`gentle: ${gentleMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Loud effect
            const loudMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "IMPORTANT MESSAGE!",
                effectId: MESSAGE_EFFECTS.loud,
            });
            console.log(`loud: ${loudMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Slam effect
            const slamMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "BAM!",
                effectId: MESSAGE_EFFECTS.slam,
            });
            console.log(`slam: ${slamMessage.guid}`);

            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Invisible ink effect
            const invisibleMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Secret message!",
                effectId: MESSAGE_EFFECTS.invisible_ink,
            });
            console.log(`invisible ink: ${invisibleMessage.guid}`);

            console.log("\nAvailable effects:");
            console.log(JSON.stringify(MESSAGE_EFFECTS, null, 2));
        } catch (error) {
            handleError(error, "Failed to send message with effect");
            console.log("\nNote: Effects require Private API to be enabled");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
