"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const shelljs_1 = __importDefault(require("shelljs"));
const find_up_1 = __importDefault(require("find-up"));
const path_1 = __importDefault(require("path"));
const home_or_tmp_1 = __importDefault(require("home-or-tmp"));
exports.cwd = shelljs_1.default.pwd().toString();
exports.readFileAsync = util_1.promisify(fs_1.default.readFile);
exports.writeFileAsync = util_1.promisify(fs_1.default.writeFile);
function logCli(fn) {
    return (args, options, logger) => {
        logger.debug("");
        logger.debug("Command Args");
        logger.debug(args);
        logger.debug("");
        logger.debug("Command Options");
        logger.debug(options);
        logger.debug("");
        return fn(args, options, logger);
    };
}
exports.logCli = logCli;
class FunctionParameter {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}
exports.FunctionParameter = FunctionParameter;
exports.localScfPath = (templatesDir) => __awaiter(this, void 0, void 0, function* () {
    let tempPath = yield find_up_1.default(templatesDir, { type: "directory" });
    if (tempPath) {
        return tempPath;
    }
    return undefined;
});
exports.localTemplatePath = (templatesDir, templateName) => __awaiter(this, void 0, void 0, function* () {
    let tempPath = yield exports.localScfPath(templatesDir);
    if (tempPath) {
        tempPath = path_1.default.join(tempPath, templateName);
        if (shelljs_1.default.test("-d", tempPath)) {
            return tempPath;
        }
    }
    return undefined;
});
exports.globalScfPath = path_1.default.resolve(home_or_tmp_1.default, ".scf");
shelljs_1.default.mkdir("-p", exports.globalScfPath);
exports.globalTemplatePath = (templateName) => path_1.default.join(exports.globalScfPath, templateName);
exports.getTemplatesPath = (templatesDir, templateName) => __awaiter(this, void 0, void 0, function* () {
    let localPath = yield exports.localTemplatePath(templatesDir, templateName);
    return localPath || exports.globalTemplatePath(templateName);
});
exports.projectPath = (projectName) => {
    // return path.join(cwd, projectName);
    return projectName;
};
