import { codeBlock } from "@discordjs/builders";
import { EmbedBuilder, escapeCodeBlock, WebhookClient } from "discord.js";
import { CONFIG } from "./config";

const webhookClient = new WebhookClient({ url: CONFIG.LOG_WEBHOOK });

export async function logMessage(msg: string) {
  await webhookClient.send({
    content: CONFIG.LOG_MENTION + " " + msg,
  });
}

export async function logError(e: Error) {
  const errText: string = e.stack ?? e.toString();
  await webhookClient.send({
    content: CONFIG.LOG_MENTION,
    embeds: [
      new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Error")
        .setDescription(codeBlock(escapeCodeBlock(errText))),
    ],
  });
}
