import minimist from "minimist";
import { minimistOptions, displayUsageInfo, printVersion } from "./bin";
import { exists } from "fs";

let argv = minimist(process.argv.slice(2), minimistOptions);

if (argv.help) {
  console.log("");
  printVersion();
  displayUsageInfo(argv);
  process.exit();
}

if (argv.version) {
  printVersion();
  process.exit();
}
