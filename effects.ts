export const MESSAGE_EFFECTS = {
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

export type MessageEffectKey = keyof typeof MESSAGE_EFFECTS;

export type MessageEffectId = (typeof MESSAGE_EFFECTS)[MessageEffectKey];
