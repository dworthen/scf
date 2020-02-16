"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var os_1 = __importDefault(require("os"));
exports.homeOrTemp = os_1.default.homedir() || os_1.default.tmpdir();
exports.default = exports.homeOrTemp;
//# sourceMappingURL=home-or-tmp.js.map