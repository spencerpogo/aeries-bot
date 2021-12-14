import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { CONFIG } from "../config";

function main() {
  const rest = new REST({ version: "9" }).setToken(CONFIG.TOKEN);

  const args = process.argv.slice(2);
  const cmd = args[0];
  if (cmd == "global") {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
  }
}

main();
