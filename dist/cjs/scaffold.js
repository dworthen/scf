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
const shelljs_1 = __importDefault(require("shelljs"));
const utils_1 = require("./utils");
const validators_1 = require("./validators");
const path_1 = __importDefault(require("path"));
exports.default = utils_1.logCli(function scafold(args, options, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        let templatesPath = yield utils_1.getTemplatesPath(options.templatesDirectory, args.name);
        let projPath = utils_1.projectPath(args.as);
        let templateFiles = shelljs_1.default.ls("-R", templatesPath);
        logger.debug(projPath);
    });
});
function scaffoldFile(filePath, contents) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = [
            new utils_1.FunctionParameter("file", filePath),
            new utils_1.FunctionParameter("contents", contents)
        ];
        for (const param of params) {
            let [isErr, err] = validators_1.isError(validators_1.notNull(param));
            if (isErr)
                throw err;
            [isErr, err] = validators_1.isError(validators_1.typeOf(param, "string"));
            if (isErr)
                throw err;
        }
        try {
            shelljs_1.default.mkdir("-p", path_1.default.dirname(filePath));
            yield utils_1.writeFileAsync(filePath, contents, "utf8");
        }
        catch (err) {
            throw new Error(`Unable to write to ${filePath}. Error: ${err.message}`);
        }
    });
}
exports.scaffoldFile = scaffoldFile;
