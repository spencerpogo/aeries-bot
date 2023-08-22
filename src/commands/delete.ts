import { SlashCommandBuilder } from "@discordjs/builders";
import { Prisma } from "@prisma/client";
import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { prisma } from "../db.js";
import { logMessage } from "../logging.js";
import { CommandType } from "../types";

async function handler(interaction: ChatInputCommandInteraction<CacheType>) {
  await interaction.deferReply({ ephemeral: true });

  try {
    await prisma.user.delete({ where: { discordId: interaction.user.id } });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code == "P2025"
    ) {
      await interaction.editReply(
        "The bot doesn't have any data on you, so there's nothing to delete!"
      );
      return;
    }
    throw e;
  }

  await interaction.editReply(
    "Your account has been sucessfully deleted. Sorry to see you go! :wave:"
  );
  await logMessage(`Account delete by <@${interaction.user.id}>`);
}

export const DeleteCommand: CommandType = {
  meta: new SlashCommandBuilder()
    .setName("deletemydata")
    .setDescription(
      "Deletes all the data the bot has stored for your account."
    ),
  handler,
};
