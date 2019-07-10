/// <reference types="node" />
import fs from "fs";
export declare const readFileAsync: typeof fs.readFile.__promisify__;
export declare const writeFileAsync: typeof fs.writeFile.__promisify__;
export declare enum ValidationOperations {
    notNull = "notNull",
    instanceOf = "instanceOf",
    typeOf = "typeOf",
    eq = "eq",
    neq = "neq",
    gt = "gt",
    gte = "gte",
    lt = "lt",
    lte = "lte"
}
export interface Parameter {
    name: string;
    value: any;
}
export declare class FunctionParameter implements Parameter {
    name: string;
    value: any;
    constructor(name: string, value: any);
}
