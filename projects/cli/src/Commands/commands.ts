import { defaultUsage, createUsage } from "./commandUsage";
import type { ParsedArgs } from "minimist";
import { createCommand } from './createCommand';

interface CommandData {
  command: (argv: ParsedArgs) => Promise<void>;
  usage: string;
}

const commands = new Map<string, CommandData>();

commands.set("default", {
  command: createCommand,
  usage: defaultUsage
});

commands.set("create", {
  command: createCommand,
  usage: createUsage
});

export function getCommandUsage(command: string) {
  if (commands.has(command)) {
    return commands.get(command)!.usage;
  }

  return commands.get("default")!.usage;
}

export function getCommand(command: string) {
  if(commands.has(command)) {
    return commands.get(command)!.command;
  }
  return commands.get("default")!.command;
}
