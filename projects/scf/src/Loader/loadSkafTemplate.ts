import { validate } from "@dworthen/bycontract";
// import fs from 'fs';
// import util from 'util';
import path from "path";
import shell from "shelljs";
// import gitIgnore from "ignore";

export function loadSkafTemplate(from: string, to: string): Array<FileObj> {
  validate([from, to], ["string", "string"]);

  from = path.normalize(from).replace(/(?:\\|\/)$/, "");
  to = path.normalize(to).replace(/(?:\\|\/)$/, "");

  // const ig = gitIgnore().add(ignore);

  return shell.ls("-R", from).reduce<Array<FileObj>>((acc, cur) => {
    const file = path
      .normalize(cur)
      .replace(/^(?:\.*\\|\/)/, "")
      .replace(/(?:\\|\/)$/, "");
    // if (ig.ignores(file)) return acc;
    const fullPath = path.join(from, cur);
    const isFile = shell.test("-f", fullPath);
    const contents = isFile && shell.cat(fullPath).toString();
    return [
      ...acc,
      {
        from,
        to,
        name: file,
        type: isFile
          ? "file"
          : shell.test("-d", fullPath)
          ? "directory"
          : "unknown",
        ...(isFile && { contents })
      } as FileObj
    ];
  }, []);
}

// console.log(load(path.resolve(__dirname, ".."), __dirname));
