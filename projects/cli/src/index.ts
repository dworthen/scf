import minimist from "minimist";
import { minimistOptions, loadSkafConfig } from "./Config";
import { displayUsageInfo, printVersion } from "./bin";
import { getCommand } from "./Commands";

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

  let selectedCommand = (argv._[0] || "create").toLowerCase();

  let command = getCommand(selectedCommand);
  await command(argv);
}

run().then(_ => {
  process.exit();
});
