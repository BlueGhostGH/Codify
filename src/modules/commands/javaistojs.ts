import { Command } from "@enitoni/gears-discordjs";
import { MessageAttachment } from "discord.js";

import { matchPrefixesStrict } from "../../common/matching/matchPrefixesStrict";
import { createMetadata } from "./help/createMetadata";

export default new Command()
    .match(matchPrefixesStrict("javaistojs|javatojs"))
    .setMetadata(
        createMetadata({
            name: "Java is to js",
            usage: "cc!javatojs/javaistojs",
            description:
                "Sends an image that explains what java is to javascript"
        })
    )
    .use(context => {
        const { message } = context;

        message.delete();

        const attachment = new MessageAttachment(
            `src/common/images/javaistojs.png`
        );
        return message.channel.send(attachment);
    });
