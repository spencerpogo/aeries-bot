import { DeleteCommand } from "./commands/delete";
import { HelloCommand } from "./commands/hello";
import { LoginCommand } from "./commands/login";
import { NotificationsCommand } from "./commands/notifications";
import { SetupCommand } from "./commands/setup";

export const COMMANDS = [
  HelloCommand,
  LoginCommand,
  NotificationsCommand,
  SetupCommand,
  DeleteCommand,
];
