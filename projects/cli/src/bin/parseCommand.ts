import { commands } from "./options";
import minimist from "minimist";

export type Command = {
  [key: string]: any;
  command: string;
  args: string[];
  wasCommandSpecified: boolean;
};

export function parseCommand(args: minimist.ParsedArgs): Command {
  const wasCommandSpecified = commands.includes(args._[0]);
  const command = wasCommandSpecified ? args.shift() : "create";
  const a = args._;
  delete args._;
  delete args.__;
  return {
    command,
    args: a,
    wasCommandSpecified,
    ...args
  };
}
