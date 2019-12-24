import commandLineUsage from "command-line-usage";
import { scfOptions, createOptions } from "./options";

export default commandLineUsage(scfOptions);
export const create = commandLineUsage(createOptions);
