import type {ParsedArgs} from "minimist";


export async function createCommand(argv: ParsedArgs): Promise<void> {

  let [from, to = "."] = argv._[0]?.toLowerCase() === "create" 
    ? argv._.slice(1) 
    : argv._.slice(0);

  

}