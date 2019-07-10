import shell from "shelljs";
import {
  writeFileAsync,
  FunctionParameter,
  getTemplatesPath,
  projectPath,
  logCli
} from "./utils";
import { notNull, typeOf, isError } from "./validators";
import path from "path";

export default logCli(async function scafold(
  args: CliArgs,
  options: CliOptions,
  logger: Logger
) {
  let templatesPath = await getTemplatesPath(
    options.templatesDirectory,
    args.name
  );
  let projPath = projectPath(args.as);
  let templateFiles = shell.ls("-R", templatesPath);
  logger.debug(projPath);
});

export async function scaffoldFile(filePath: string, contents: string) {
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
    shell.mkdir("-p", path.dirname(filePath));
    await writeFileAsync(filePath, contents, "utf8");
  } catch (err) {
    throw new Error(`Unable to write to ${filePath}. Error: ${err.message}`);
  }
}
