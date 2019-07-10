"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
exports.readFileAsync = util_1.promisify(fs_1.default.readFile);
exports.writeFileAsync = util_1.promisify(fs_1.default.writeFile);
var ValidationOperations;
(function (ValidationOperations) {
    ValidationOperations["notNull"] = "notNull";
    ValidationOperations["instanceOf"] = "instanceOf";
    ValidationOperations["typeOf"] = "typeOf";
    ValidationOperations["eq"] = "eq";
    ValidationOperations["neq"] = "neq";
    ValidationOperations["gt"] = "gt";
    ValidationOperations["gte"] = "gte";
    ValidationOperations["lt"] = "lt";
    ValidationOperations["lte"] = "lte";
})(ValidationOperations = exports.ValidationOperations || (exports.ValidationOperations = {}));
class FunctionParameter {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}
exports.FunctionParameter = FunctionParameter;
