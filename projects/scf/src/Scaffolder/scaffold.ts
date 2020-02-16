import { validate, typedef } from "@dworthen/bycontract";
import shell from "shelljs";
import path from "path";

typedef("FileObj", {
  from: "string",
  to: "string",
  name: "string",
  type: "string"
});

export function scaffold(files: FileObj[]): void {
  validate([files], ["Array.<FileObj>"]);

  for (let file of files) {
    const location = path.join(file.to, file.name);
    const directory =
      file.type === "directory" ? location : path.dirname(location);
    if (!shell.test("-e", directory)) {
      shell.mkdir("-p", directory);
    }
    if (file.type === "file" && file.contents) {
      shell.ShellString(file.contents).to(location);
    }
  }
}
