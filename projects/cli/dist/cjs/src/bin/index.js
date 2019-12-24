"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseCli_1 = require("./parseCli");
const parseCommand_1 = require("./parseCommand");
const help_1 = require("./help");
const version_1 = require("./version");
const args = parseCli_1.parseCli(process.argv.slice(2));
const argv = parseCommand_1.parseCommand(args);
if (help_1.printHelp(argv))
    process.exit(1);
if (version_1.printVersion(argv))
    process.exit(1);
//# sourceMappingURL=index.js.map