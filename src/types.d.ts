import { CommandInteraction } from "discord.js";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord.js/node_modules/discord-api-types";

export interface CommandMeta {
  name: string;
  toJSON: () => RESTPostAPIApplicationCommandsJSONBody;
}

export type CommandType = {
  meta: CommandMeta;
  handler: (interaction: CommandInteraction) => Promise<void>;
};
