import minimist from "minimist";
import { minimistOptions, loadSkafConfig } from "./Config";
import { displayUsageInfo, printVersion } from "./bin";
import { exists } from "fs";
import { runInContext } from "vm";

async function run(): Promise<void> {
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
}

run().then(_ => {
  process.exit();
});
