import { version } from "../../package.json";
import { Command } from "./parseCommand";

export function printVersion(argv: Command): boolean {
  if (argv.v) {
    console.log(`SCF Version: ${version}`);
    return true;
  }
  return false;
}
