"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("./options");
function parseCommand(args) {
    const wasCommandSpecified = options_1.commands.includes(args._[0]);
    const command = wasCommandSpecified ? args.shift() : "create";
    const a = args._;
    delete args._;
    delete args.__;
    return Object.assign({ command, args: a, wasCommandSpecified }, args);
}
exports.parseCommand = parseCommand;
//# sourceMappingURL=parseCommand.js.map