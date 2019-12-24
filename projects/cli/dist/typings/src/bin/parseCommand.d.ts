import minimist from "minimist";
export declare type Command = {
    [key: string]: any;
    command: string;
    args: string[];
    wasCommandSpecified: boolean;
};
export declare function parseCommand(args: minimist.ParsedArgs): Command;
