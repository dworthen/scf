import shell from "shelljs";
import { writeFileAsync, FunctionParameter } from "./utils";
import { notNull, typeOf, isError } from "./validators";
import path from "path";

export const scaffold = async (filePath: string, contents: string) => {
  const params = [
    new FunctionParameter("file", filePath),
    new FunctionParameter("contents", contents)
  ];

  for (const param of params) {
    let [isErr, err] = isError(notNull(param));
    if (isErr) throw err;
    [isErr, err] = isError(typeOf(param, "string"));
    if (isErr) throw err;
  }

  try {
    await writeFileAsync(filePath, contents, "utf8");
  } catch (err) {
    throw new Error(`Unable to write to ${filePath}. Error: ${err.message}`);
  }
};
