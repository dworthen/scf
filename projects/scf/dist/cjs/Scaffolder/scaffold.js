"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bycontract_1 = require("bycontract");
const shelljs_1 = __importDefault(require("shelljs"));
const path_1 = __importDefault(require("path"));
bycontract_1.typedef("FileObj", {
    from: "string",
    to: "string",
    name: "string",
    type: "string"
});
function scaffold(files) {
    bycontract_1.validate([files], ["Array.<FileObj>"]);
    for (let file of files) {
        const location = path_1.default.join(file.to, file.name);
        const directory = file.type === "directory" ? location : path_1.default.dirname(location);
        if (!shelljs_1.default.test("-e", directory)) {
            shelljs_1.default.mkdir("-p", directory);
        }
        if (file.type === "file" && file.contents) {
            shelljs_1.default.ShellString(file.contents).to(location);
        }
    }
}
exports.scaffold = scaffold;
//# sourceMappingURL=scaffold.js.map