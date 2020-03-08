import { defaultUsage, createUsage } from "./commandUsage";

interface CommandData {
  usage: string;
}

const commands = new Map<string, CommandData>();

commands.set("default", {
  usage: defaultUsage
});

commands.set("create", {
  usage: createUsage
});

export function getCommandUsage(command: string) {
  if (commands.has(command)) {
    return commands.get(command)!.usage;
  }

  return commands.get("default")!.usage;
}
