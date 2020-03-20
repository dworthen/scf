import commandLineUsage from "command-line-usage";
import { scfOptions, createOptions, installOptions } from "./commandOptions";

export const defaultUsage = commandLineUsage(scfOptions);
export const createUsage = commandLineUsage(createOptions);
export const installUsage = commandLineUsage(installOptions);
