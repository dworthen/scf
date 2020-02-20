"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bycontract_1 = require("@dworthen/bycontract");
// import fs from 'fs';
// import util from 'util';
var path_1 = __importDefault(require("path"));
var shelljs_1 = __importDefault(require("shelljs"));
// import gitIgnore from "ignore";
function loadSkafTemplate(from, to) {
    bycontract_1.validate([from, to], ["string", "string"]);
    from = path_1.default.normalize(from).replace(/(?:\\|\/)$/, "");
    to = path_1.default.normalize(to).replace(/(?:\\|\/)$/, "");
    // const ig = gitIgnore().add(ignore);
    return shelljs_1.default.ls("-R", from).reduce(function (acc, cur) {
        var file = path_1.default
            .normalize(cur)
            .replace(/^(?:\.*\\|\/)/, "")
            .replace(/(?:\\|\/)$/, "");
        // if (ig.ignores(file)) return acc;
        var fullPath = path_1.default.join(from, cur);
        var isFile = shelljs_1.default.test("-f", fullPath);
        var contents = isFile && shelljs_1.default.cat(fullPath).toString();
        return __spreadArrays(acc, [
            __assign({ from: from,
                to: to, name: file, type: isFile
                    ? "file"
                    : shelljs_1.default.test("-d", fullPath)
                        ? "directory"
                        : "unknown" }, (isFile && { contents: contents }))
        ]);
    }, []);
}
exports.loadSkafTemplate = loadSkafTemplate;
// console.log(load(path.resolve(__dirname, ".."), __dirname));
//# sourceMappingURL=loadSkafTemplate.js.map