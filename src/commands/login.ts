import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, CacheType } from "discord.js";
import { getClient, LoginError } from "../aeries.js";
import { prisma } from "../db.js";
import { logMessage } from "../logging.js";
import { CommandType } from "../types";

async function handler(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
  const username = interaction.options.getString("username");
  const password = interaction.options.getString("password");
  if (!username || !password) {
    await interaction.reply({
      content: "Username and password are required",
      ephemeral: true,
    });
    return;
  }
  await interaction.deferReply({ ephemeral: true });
  // Make sure the login works
  const aeriesClient = getClient();
  try {
    await aeriesClient.login(username, password);
  } catch (e) {
    if (e instanceof LoginError) {
      await interaction.editReply("Those credentials didn't work. Try again.");
    } else {
      console.error("Unexpected Login error:", e);
      await interaction.editReply(
        "An unexpected error ocurred while logging in. Check your credentials and try again later."
      );
    }
    return;
  }
  // commit it to the DB
  const discordId = interaction.user.id;
  const data = { portalUsername: username, portalPassword: password };
  await prisma.user.upsert({
    where: { discordId },
    update: data,
    create: {
      ...data,
      discordId,
      notificationsEnabled: false,
    },
  });
  // TODO: Prompt to enable notifications
  await interaction.editReply("You have been sucessfully registered.");
  await logMessage(`New signup: ${username}`);
}

export const LoginCommand: CommandType = {
  meta: new SlashCommandBuilder()
    .setName("login")
    .setDescription("Update your aeries login information")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Aeries username")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("password")
        .setDescription("Aeries password")
        .setRequired(true)
    ),
  handler,
};
