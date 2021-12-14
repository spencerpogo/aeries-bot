import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export type CommandType = {
  meta: SlashCommandBuilder;
  handler: (interaction: CommandInteraction) => Promise<void>;
};
