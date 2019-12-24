"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minimist_1 = __importDefault(require("minimist"));
const options_1 = require("./options");
function parseCli(args) {
    return minimist_1.default(args, options_1.minimistOptions);
}
exports.parseCli = parseCli;
//# sourceMappingURL=parseCli.js.map