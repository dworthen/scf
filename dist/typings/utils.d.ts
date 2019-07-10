/// <reference types="node" />
import fs from "fs";
export declare const cwd: string;
export declare const readFileAsync: typeof fs.readFile.__promisify__;
export declare const writeFileAsync: typeof fs.writeFile.__promisify__;
export declare function logCli(fn: (args: CliArgs, options: CliOptions, logger: Logger) => any): (args: CliArgs, options: CliOptions, logger: Logger) => any;
export interface Parameter {
    name: string;
    value: any;
}
export declare class FunctionParameter implements Parameter {
    name: string;
    value: any;
    constructor(name: string, value: any);
}
export declare const localScfPath: (templatesDir: string) => Promise<string | undefined>;
export declare const localTemplatePath: (templatesDir: string, templateName: string) => Promise<string | undefined>;
export declare const globalScfPath: string;
export declare const globalTemplatePath: (templateName: string) => string;
export declare const getTemplatesPath: (templatesDir: string, templateName: string) => Promise<string>;
export declare const projectPath: (projectName: string) => string;
