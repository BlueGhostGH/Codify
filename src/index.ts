import { Bot, matchPrefixes } from "@enitoni/gears";
import { Adapter, CommandGroupBuilder } from "@enitoni/gears-discordjs";

import { parseArguments } from "./common/parsing/middleware/parseArguments";
import { app, port, prefix } from "./modules/constants";

import anyway from "./modules/commands/anyway";
import daily from "./modules/commands/daily";
import description from "./modules/commands/description";
import gamble from "./modules/commands/gamble";
import help from "./modules/commands/help";
import joke from "./modules/commands/joke";
import meme from "./modules/commands/meme";
import pay from "./modules/commands/pay";
import profile from "./modules/commands/profile";
import say from "./modules/commands/say";
import topbalance from "./modules/commands/topbalance";

const adapter = new Adapter({ token: process.env.BOT_TOKEN || "" });

const commands = new CommandGroupBuilder()
    .match(matchPrefixes(prefix))
    .use(parseArguments)
    .setCommands(
        description,
        profile,
        say,
        daily,
        gamble,
        meme,
        topbalance,
        joke,
        pay,
        anyway,
        help
    ) /// Make sure help is the last command or it will break things.
    .done();

const bot = new Bot({ adapter, commands: [commands] });

bot.on("error", err => console.log("Error ", err));

const init = async (): Promise<void> => {
    console.info(`Connecting to discord...`);
    await bot.start();
    console.info(`Logged in as ${bot.client.user.tag}`);

    await bot.client.user.setActivity(`🚰 Drinking water!`);
    console.info(`Bot activity is set up!`);

    console.info(`The bot is up and running!`);
};

app.listen(port, init);
