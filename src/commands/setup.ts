import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, CacheType } from "discord.js";
import { CommandType } from "../types";

const MSG = [
  "**Read before you use Aeries Bot**",
  "1. This bot is **experimental** and subject to bugs. Please report any that you find" +
    " so that they can be fixed!",
  "2. You will be required to provide your Aeries password so the bot can log in to" +
    " your account. **You are trusting the bot owner to not view your password.** If" +
    " you would like to host it yourself ask I and I can show you how!",
  "3. Use at your own risk! There is almost no chance you will get in any trouble for" +
    " using this but bot owner is not responsible if you do!",
  "",
  "You can set up the bot using `/login`.",
].join("\n");

async function handler(interaction: ChatInputCommandInteraction<CacheType>) {
  await interaction.reply(MSG);
}

export const SetupCommand: CommandType = {
  meta: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Provides info about using the bot."),
  handler,
};
