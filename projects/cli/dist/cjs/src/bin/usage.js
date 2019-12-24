"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const options_1 = require("./options");
exports.default = command_line_usage_1.default(options_1.scfOptions);
exports.create = command_line_usage_1.default(options_1.createOptions);
//# sourceMappingURL=usage.js.map