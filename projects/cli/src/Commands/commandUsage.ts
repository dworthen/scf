import commandLineUsage from "command-line-usage";
import { scfOptions, createOptions } from "../Config";
import type {ParsedArgs} from "minimist";

export const defaultUsage = commandLineUsage(scfOptions);
export const createUsage = commandLineUsage(createOptions);

