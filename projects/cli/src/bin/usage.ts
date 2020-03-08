import commandLineUsage from "command-line-usage";
import { scfOptions, createOptions, commands } from "./options";
import type {ParsedArgs} from "minimist";

const defaultUsage = commandLineUsage(scfOptions);
const createUsage = commandLineUsage(createOptions);

export function displayUsageInfo(args: ParsedArgs) {

  let command = args._[0] || "default";

  switch (command) {
    case "create":
      console.log(createUsage);
      break;
    default:
      console.log(defaultUsage);
      break;
  }

}
