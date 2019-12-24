import { parseCli } from "./parseCli";
import { parseCommand } from "./parseCommand";
import { printHelp } from "./help";
import { printVersion } from "./version";

const args = parseCli(process.argv.slice(2));
const argv = parseCommand(args);

if (printHelp(argv)) process.exit(1);
if (printVersion(argv)) process.exit(1);
