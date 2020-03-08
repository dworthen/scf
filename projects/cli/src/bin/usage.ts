import type {ParsedArgs} from "minimist";
import { getCommandUsage } from '../Commands';


export function displayUsageInfo(args: ParsedArgs) {

  let command = (args._[0] || "default").toLowerCase();

  console.log(getCommandUsage(command));

}
