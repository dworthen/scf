"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils = __importStar(require("./utils"));
const validators_1 = require("./validators");
exports.scaffold = (file, contents) => __awaiter(this, void 0, void 0, function* () {
    const params = [
        new utils.FunctionParameter("file", file),
        new utils.FunctionParameter("contents", contents)
    ];
    for (const param of params) {
        let [isErr, err] = validators_1.isError(validators_1.notNull(param));
        if (isErr)
            throw err;
        [isErr, err] = validators_1.isError(validators_1.typeOf(param, "string"));
        if (isErr)
            throw err;
    }
    // try {
    //   await writeFileAsync(file, contents, "utf8");
    // } catch (err) {
    //   throw new Error(`Unable to write to ${file}. Error: ${err.message}`);
    // }
});
exports.scaffold("cool", 5);
