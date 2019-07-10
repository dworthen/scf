import fs from "fs";
import { promisify } from "util";
import shell from "shelljs";
import findUp from "find-up";
import path from "path";
import homeOrTmp from "home-or-tmp";

export const cwd = shell.pwd().toString();

export const readFileAsync = promisify(fs.readFile);
export const writeFileAsync = promisify(fs.writeFile);

export function logCli(
  fn: (args: CliArgs, options: CliOptions, logger: Logger) => any
) {
  return (args: CliArgs, options: CliOptions, logger: Logger) => {
    logger.debug("");
    logger.debug("Command Args");
    logger.debug(args);
    logger.debug("");
    logger.debug("Command Options");
    logger.debug(options);
    logger.debug("");
    return fn(args, options, logger);
  };
}

export interface Parameter {
  name: string;
  value: any;
}

export class FunctionParameter implements Parameter {
  public name: string;
  public value: any;
  constructor(name: string, value: any) {
    this.name = name;
    this.value = value;
  }
}

export const localScfPath = async (templatesDir: string) => {
  let tempPath = await findUp(templatesDir, { type: "directory" });
  if (tempPath) {
    return tempPath;
  }
  return undefined;
};

export const localTemplatePath = async (
  templatesDir: string,
  templateName: string
) => {
  let tempPath = await localScfPath(templatesDir);
  if (tempPath) {
    tempPath = path.join(tempPath, templateName);
    if (shell.test("-d", tempPath)) {
      return tempPath;
    }
  }
  return undefined;
};

export const globalScfPath = path.resolve(homeOrTmp, ".scf");

shell.mkdir("-p", globalScfPath);

export const globalTemplatePath = (templateName: string) =>
  path.join(globalScfPath, templateName);

export const getTemplatesPath = async (
  templatesDir: string,
  templateName: string
) => {
  let localPath = await localTemplatePath(templatesDir, templateName);
  return localPath || globalTemplatePath(templateName);
};

export const projectPath = (projectName: string) => {
  // return path.join(cwd, projectName);
  return projectName;
};
