import { defaultUsage, createUsage, installUsage } from "./commandUsage";
import type { ParsedArgs } from "minimist";
import { createCommand } from './createCommand';
import { installCommand } from './installCommand';

export interface CommandData {
  command: (argv: ParsedArgs) => Promise<any>;
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

commands.set("install", {
  command: installCommand,
  usage: installUsage
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
