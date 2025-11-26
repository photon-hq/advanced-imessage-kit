import { createSDK, handleError } from "./utils";

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
    const sdk = createSDK();

    sdk.on("ready", async () => {
        console.log("Message effects example...\n");
        console.log("⚠️  Note: Effects require Private API to be enabled\n");

        try {
            console.log("Sending message with confetti effect 🎉");
            const confettiMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Happy Birthday! 🎂",
                effectId: MESSAGE_EFFECTS.confetti,
            });
            console.log(`✓ Confetti message sent! GUID: ${confettiMessage.guid}\n`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log("Sending message with fireworks effect 🎆");
            const fireworksMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Celebration time! 🎊",
                effectId: MESSAGE_EFFECTS.fireworks,
            });
            console.log(`✓ Fireworks message sent! GUID: ${fireworksMessage.guid}\n`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log("Sending message with balloons effect 🎈");
            const balloonsMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Congratulations! 🥳",
                effectId: MESSAGE_EFFECTS.balloons,
            });
            console.log(`✓ Balloons message sent! GUID: ${balloonsMessage.guid}\n`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log("Sending message with invisible ink effect 🕵️");
            const invisibleMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "Secret message! 🤫",
                effectId: MESSAGE_EFFECTS.invisible_ink,
            });
            console.log(`✓ Invisible ink message sent! GUID: ${invisibleMessage.guid}\n`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log("Sending message with loud/slam effect 💥");
            const loudMessage = await sdk.messages.sendMessage({
                chatGuid: CHAT_GUID,
                message: "IMPORTANT MESSAGE!",
                effectId: MESSAGE_EFFECTS.loud,
            });
            console.log(`✓ Loud message sent! GUID: ${loudMessage.guid}\n`);

            console.log("All effects demonstrated! Available effects:");
            console.log(JSON.stringify(MESSAGE_EFFECTS, null, 2));
        } catch (error) {
            handleError(error, "Failed to send message with effect");
            console.log("\n⚠️  Make sure Private API is enabled on the server to use effects!");
        }

        await sdk.close();
        process.exit(0);
    });

    await sdk.connect();
}

main().catch(console.error);
