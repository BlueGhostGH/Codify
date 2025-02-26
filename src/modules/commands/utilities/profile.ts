import { Command } from "@enitoni/gears-discordjs";

import { ParseArgumentsState } from "../../../common/parsing/middleware/parseArguments";
import { matchPrefixesStrict } from "../../../common/matching/matchPrefixesStrict";

import knex from "../../../../db/knex";
import { checkAndInitProfile } from "../../../common/knexCommon";
import { createMetadata } from "../help/createMetadata";
import { findUserByName } from "../../../common/findUserByName";
import {
    Cooldown,
    setCooldown
} from "../../../common/cooldown/middleware/comandCooldown";

async function pullData(id: string) {
    await checkAndInitProfile(id);

    return knex("user").where("userid", id);
}

export default new Command()
    .match(matchPrefixesStrict("profile"))
    .setMetadata(
        createMetadata({
            name: "Shows a profile",
            usage: "cc!profile <user>",
            description:
                "Show the profile of a user. The default is the profile of the one who sends the command."
        })
    )
    .use<Cooldown>(setCooldown(5000))
    .use<ParseArgumentsState>(async context => {
        const { message } = context;
        const { args } = context.state;

        try {
            let profileData;
            if (args.length) {
                if (!message.mentions.users.first()) {
                    const matchingUsers = await findUserByName(
                        message.guild!,
                        args.join(" ")
                    );
                    if (matchingUsers.length >= 2) {
                        return message.channel.send(
                            `**OOPS:** There are multiple users that can match that name! Possible users include: \n${matchingUsers
                                .map(l => `- \`${l.user.username}\``)
                                .join("\n")}`
                        );
                    } else if (matchingUsers.length === 1) {
                        profileData = (await pullData(matchingUsers[0].id))[0];
                    } else {
                        return message.channel.send(
                            `**OOPS:** You need to mention a user or type in a name matching a user.`
                        );
                    }
                } else if (message.mentions.users.first()!.bot) {
                    return message.channel.send(
                        `**OOPS:** Looks like bots can't have profiles.`
                    );
                } else {
                    profileData = (
                        await pullData(message.mentions.users.first()!.id)
                    )[0];
                }
            } else {
                profileData = (await pullData(message.author.id))[0];
            }

            return message.channel.send({
                embed: {
                    description: "**Here you go!**",
                    color: 3447003,
                    fields: [
                        {
                            name: "😀 Nickname:",
                            value: `${
                                (
                                    await message.guild!.members.fetch(
                                        `${profileData.userid}`
                                    )
                                )?.displayName
                            }`
                        },
                        {
                            name: "↗️ Level:",
                            value: `${profileData.level}`,
                            inline: true
                        },
                        {
                            name: "⭐ Xp until level up:",
                            value: `${Math.floor(
                                Math.sqrt(profileData.level) * 100
                            ) - profileData.xp}`,
                            inline: true
                        },
                        {
                            name: "💬 Description:",
                            value: `${profileData.description}`
                        },
                        {
                            name: "💰 Balance:",
                            value: `${profileData.balance}`,
                            inline: true
                        },
                        {
                            name: "📅 Last daily claim:",
                            value:
                                profileData.lastdaily === "Never claimed."
                                    ? "Never claimed."
                                    : `${
                                          profileData.lastdaily
                                      }/${new Date().getMonth() +
                                          1}/${new Date().getFullYear()}`,
                            inline: true
                        }
                    ]
                }
            });
        } catch (e) {
            console.info(e);
            return message.channel.send(
                `**ERROR:** Something went wrong. Try \`cc!help\` for more info.`
            );
        }
    });
