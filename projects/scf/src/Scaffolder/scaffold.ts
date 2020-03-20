import { typedef, validate } from "@dworthen/bycontract";
import type { FileObj, Formatter } from '../types';
import { FileSystem } from '@microsoft/node-core-library';
import path from 'path';

typedef("FileObj", {
  from: "string",
  to: "string",
  name: "string",
  relativePath: "string"
});

export async function scaffold(files: FileObj[], formatter: Formatter): Promise<void> {
  validate([files], ["Array.<FileObj>"]);

  let fileMapper = new Map<string, string>();

  for (let file of files) {
    fileMapper.set(file.relativePath.replace(/\\/g, "/").replace(/^\.\//, ""), file.name.replace(/\\/g, "/"));
  }

  for (let file of files) {
    file.files = fileMapper;
    const location = path.join(file.to, file.name);
    if (file.stats.isFile()) {
      FileSystem.ensureFolder(path.dirname(location));
      if(file.contents) {
        let contents = file.contents;
        if(file.format !== undefined && file.format) {
          contents = await formatter(file);
        }
        FileSystem.writeFile(location, contents);
      } else {
        FileSystem.copyFile({
          sourcePath: path.join(file.from, file.relativePath),
          destinationPath: location
        });
      }
    } else {
      FileSystem.ensureFolder(location);
    }
  }
}
