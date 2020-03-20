import * as path from "path";
import { validate } from "@dworthen/bycontract";
import { readDir, FileListing } from "../Utils";
import type { FileObj } from "../types";

export function loadSkafTemplate(
  from: string,
  to: string,
  ignore: string[] = []
): FileObj[] {
  validate([from, to, ignore], ["string", "string", "Array.<string>"]);

  from = path.normalize(from).replace(/(?:\\|\/)$/, "");
  to = path.normalize(to).replace(/(?:\\|\/)$/, "");

  let files: FileListing[] = readDir(from, ignore, {
    stats: true
  }) as FileListing[];

  return files.map(fileListing => {
    return {
      ...fileListing,
      name: fileListing.relativePath,
      from,
      to,
      format: true
    };
  });
}
