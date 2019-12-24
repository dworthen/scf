import minimist from "minimist";
import { minimistOptions } from "./options";

export function parseCli(args: string[]) {
  return minimist(args, minimistOptions);
}
