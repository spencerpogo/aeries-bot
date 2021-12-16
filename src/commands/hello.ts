import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandType } from "../types";

async function handler(interaction: CommandInteraction) {
  await interaction.reply("Hello, world!");
}

export const HelloCommand: CommandType = {
  meta: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Replies with 'Hello, world!'"),
  handler,
};
