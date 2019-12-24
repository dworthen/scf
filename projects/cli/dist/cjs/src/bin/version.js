"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const package_json_1 = require("../../package.json");
function printVersion(argv) {
    if (argv.v) {
        console.log(`SCF Version: ${package_json_1.version}`);
        return true;
    }
    return false;
}
exports.printVersion = printVersion;
//# sourceMappingURL=version.js.map