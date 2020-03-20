import { FileSystem, Executable } from "@microsoft/node-core-library";
import path from "path";

export function install(localRepo: string) {
  if (!FileSystem.exists(path.join(localRepo, "package.json")))
    return `${localRepo} does not contain package.json`;

  const cwd = process.cwd();
  process.chdir(localRepo);

  let result = Executable.spawnSync("npm", ["install", "--production"]);

  process.chdir(cwd);
  return result;
}
