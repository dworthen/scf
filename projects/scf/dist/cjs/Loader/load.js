"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bycontract_1 = require("bycontract");
// import fs from 'fs';
// import util from 'util';
const path_1 = __importDefault(require("path"));
const shelljs_1 = __importDefault(require("shelljs"));
const ignore_1 = __importDefault(require("ignore"));
function load(from, to, ignore = []) {
    bycontract_1.validate([from, to, ignore], ["string", "string", "Array.<string>"]);
    from = path_1.default.normalize(from).replace(/(?:\\|\/)$/, "");
    to = path_1.default.normalize(to).replace(/(?:\\|\/)$/, "");
    const ig = ignore_1.default().add(ignore);
    return shelljs_1.default.ls("-R", from).reduce((acc, cur) => {
        const file = path_1.default
            .normalize(cur)
            .replace(/^(?:\.*\\|\/)/, "")
            .replace(/(?:\\|\/)$/, "");
        if (ig.ignores(file))
            return acc;
        const fullPath = path_1.default.join(from, cur);
        const isFile = shelljs_1.default.test("-f", fullPath);
        const contents = isFile && shelljs_1.default.cat(fullPath).toString();
        return [
            ...acc,
            Object.assign({ from,
                to, name: file, type: isFile
                    ? "file"
                    : shelljs_1.default.test("-d", fullPath)
                        ? "directory"
                        : "unknown" }, (isFile && { contents }))
        ];
    }, []);
}
exports.load = load;
// console.log(load(path.resolve(__dirname, ".."), __dirname));
//# sourceMappingURL=load.js.map