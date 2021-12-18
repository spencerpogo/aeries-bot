import { REST } from "@discordjs/rest";
import arg from "arg";
import { Routes } from "discord-api-types/v9";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord.js/node_modules/discord-api-types";
import { COMMANDS } from "../allCommands";
import { CONFIG } from "../config";

const commandData: RESTPostAPIApplicationCommandsJSONBody[] = COMMANDS.map(
  (c) => c.meta.toJSON()
);

async function main() {
  const args = arg({
    "--client-id": String,
    "--guild-id": String,
  });
  if (!args["--client-id"]) throw new Error("Client ID is required");
  const clientId: string = args["--client-id"];
  const rest = new REST({ version: "9" }).setToken(CONFIG.TOKEN);

  const [name, route] = args["--guild-id"]
    ? ["guild", Routes.applicationGuildCommands(clientId, args["--guild-id"])]
    : ["global", Routes.applicationCommands(clientId)];

  console.log(`Updating ${name} slash commands...`);
  await rest.put(route, { body: commandData });
}

main();
