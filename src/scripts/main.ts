import { Client } from "discord.js";
import { COMMANDS } from "../allCommands.js";
import { CONFIG } from "../config.js";
import { CommandType } from "../types";

const client = new Client({ intents: [] });

const commandsMap: Map<string, CommandType> = new Map();
for (const cmd of COMMANDS) {
  commandsMap.set(cmd.meta.name, cmd);
}

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const cmd = await commandsMap.get(interaction.commandName);
    if (cmd) {
      await cmd.handler(interaction);
    }
  }
});

client.on("ready", () => {
  console.log(`Sucessfully logged in as ${client.user?.tag ?? "??"}`);
});

async function main() {
  console.log("Starting bot...");
  await client.login(CONFIG.TOKEN);
}

main();
