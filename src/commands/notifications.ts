import { SlashCommandBuilder } from "@discordjs/builders";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/index.js";
import { CommandInteraction } from "discord.js";
import { prisma } from "../db.js";
import { CommandType } from "../types";

async function handler(interaction: CommandInteraction) {
  const subcmd = interaction.options.getSubcommand();
  let notificationsEnabled = false;
  if (subcmd == "enable") {
    notificationsEnabled = true;
  } else if (subcmd == "disable") {
    notificationsEnabled = false;
  } else {
    await interaction.reply({
      content: "Unexpected subcommand",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  // TODO: Delete notificationsCache on notifications disable

  try {
    await prisma.user.update({
      where: { discordId: interaction.user.id },
      data: { notificationsEnabled },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code == "P2025") {
      await interaction.editReply("You must login before using this command");
      return;
    }
    throw e;
  }
  await interaction.editReply(
    "Notifications sucessfully " +
      (notificationsEnabled ? "enabled" : "disabled")
  );
}

export const NotificationsCommand: CommandType = {
  meta: new SlashCommandBuilder()
    .setName("notifications")
    .setDescription("Enable or disable grade notifications")
    .addSubcommand((subcmd) =>
      subcmd.setName("enable").setDescription("Enable notifications")
    )
    .addSubcommand((subcmd) =>
      subcmd.setName("disable").setDescription("Disable notifications")
    ),
  handler,
};
