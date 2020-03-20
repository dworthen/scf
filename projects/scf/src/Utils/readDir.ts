import * as path from "path";
import { typedef, validate } from "@dworthen/bycontract";
import { FileSystem } from "@microsoft/node-core-library";
import gitIgnore from "ignore";
import type {Stats} from 'fs';

export interface ReadDirOptions {
  recurse?: boolean;
  stats?: boolean;
}

export interface FileListing {
  relativePath: string;
  stats: Stats
}

typedef("ReadDirOptions", {
  recurse: "boolean",
  stats: "boolean"
});

export function readDir(
  directory: string,
  ignore: string[] = [],
  options: ReadDirOptions = {}
): string[] | FileListing[] {

  options = Object.assign({ recurse: true, stats: false }, options);

  validate(
    [directory, ignore, options],
    ["string", "Array.<string>", "ReadDirOptions"]
  );

  if (!FileSystem.exists(directory)) return [];

  const ig = gitIgnore().add(ignore);
  let files: string[] | FileListing[] = [];
  let searchStack = [directory];

  while (searchStack.length) {
    let curDirectory = searchStack.pop()!;

    FileSystem.readFolder(curDirectory).forEach(currentPath => {
      currentPath = path.join(curDirectory, currentPath);
      let relativePath = path.relative(directory, currentPath);
      if (ig.ignores(relativePath)) return;

      let stats = FileSystem.getStatistics(currentPath);

      if(filesShouldBeStrings(files, options)) {
        files.push(relativePath);
      } else {
        files.push({
          relativePath,
          stats
        });
      }

      if (FileSystem.exists(currentPath) && options.recurse && stats.isDirectory()) {
        searchStack.push(currentPath);
      }
    });
  }

  return files;
}

function filesShouldBeStrings(files: string[] | FileListing[], options: ReadDirOptions): files is string[] {
  return !options.stats;
}

// readDir(`projects`, ["node_modules", ".git"], { stats: true });
