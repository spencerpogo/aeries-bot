import { codeBlock, Embed } from "@discordjs/builders";
import { Util, WebhookClient } from "discord.js";
import { CONFIG } from "./config.js";

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
      new Embed()
        .setColor(0xff0000)
        .setTitle("Error")
        .setDescription(codeBlock(Util.escapeCodeBlock(errText))),
    ],
  });
}
