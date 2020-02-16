"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bycontract_1 = require("@dworthen/bycontract");
var shelljs_1 = __importDefault(require("shelljs"));
var path_1 = __importDefault(require("path"));
bycontract_1.typedef("FileObj", {
    from: "string",
    to: "string",
    name: "string",
    type: "string"
});
function scaffold(files) {
    bycontract_1.validate([files], ["Array.<FileObj>"]);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var location = path_1.default.join(file.to, file.name);
        var directory = file.type === "directory" ? location : path_1.default.dirname(location);
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