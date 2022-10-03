import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, CacheType } from "discord.js";
import { CommandType } from "../types";

async function handler(interaction: ChatInputCommandInteraction<CacheType>) {
  await interaction.reply("Hello, world!");
}

export const HelloCommand: CommandType = {
  meta: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Replies with 'Hello, world!'"),
  handler,
};
