import defaultUsage, * as u from "./usage";
import { Command } from "./parseCommand";

const usage = u as { [key: string]: any };

export function printHelp(argv: Command): boolean {
  if (argv.h) {
    if (argv.wasCommandSpecified) {
      console.log(usage[argv.command]);
    } else {
      console.log(defaultUsage);
    }
    return true;
  }
  return false;
}
