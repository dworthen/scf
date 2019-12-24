"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const usage_1 = __importStar(require("./usage")), u = usage_1;
const usage = u;
function printHelp(argv) {
    if (argv.h) {
        if (argv.wasCommandSpecified) {
            console.log(usage[argv.command]);
        }
        else {
            console.log(usage_1.default);
        }
        return true;
    }
    return false;
}
exports.printHelp = printHelp;
//# sourceMappingURL=help.js.map