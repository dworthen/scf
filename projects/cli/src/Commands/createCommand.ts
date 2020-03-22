import type {ParsedArgs} from "minimist";
import { FileSystem } from "@microsoft/node-core-library";
import findUp from "find-up";
import * as path from "path";
import { globalSkafDirectory, Git, Npm } from "../Utils";
import inquirer from "inquirer";
import { loadConfig } from "../Config";
import type { SkafConfig, FileObj } from '@skaf/core';
import { Loader, Scaffolder, PluginPipeline as Pp } from "@skaf/core";
import { installCommand } from "./installCommand";
import { PluginPipeline } from "@skaf/core/dist/typings/types";

export async function createCommand(argv: ParsedArgs): Promise<void> {
  let [from, to = "."] =
    argv._[0]?.toLowerCase() === "create" ? argv._.slice(1) : argv._.slice(0);

  // TODO: Validate

  // argv.from = path.normalize(from);
  // argv.to = path.normalize(to);

  let config = await loadConfig();

  // parse from
  let templatePath = await parseFrom(from, argv, config);

  let files: FileObj[] = Loader.loadSkafTemplate(
    templatePath,
    to,
    config.ignore
  );


  if (config.plugins) {
    let pluginPipeline: PluginPipeline = Pp.buildPluginPipeline(config.plugins);
    files = (await Promise.all(files.map(file => pluginPipeline(file)))).filter(
      file => file !== undefined && file !== null
    ) as FileObj[];
  }

  await Scaffolder.scaffold(files, config.formatter!);
}

async function parseFrom(from: string, argv: ParsedArgs, config: SkafConfig) {
  let baseTemplatePath = from.replace(/#.*/gi, "");
  let [_, checkout] = Git.parseCheckoutHash(from);
  let localProjectTemplateDirectory = path.join(".skaf/", baseTemplatePath);
  let globalTemplateDirectoryPath = path.join(
    globalSkafDirectory,
    baseTemplatePath
  );

  if (config.localTemplateDirectory) {
    localProjectTemplateDirectory =
      (await findUp(
        path.join(config.localTemplateDirectory, baseTemplatePath),
        {
          type: "directory"
        }
      )) ?? localProjectTemplateDirectory;
  }

  if (
    FileSystem.exists(localProjectTemplateDirectory) &&
    Git.isGitRepo(localProjectTemplateDirectory)
  ) {
    updateRepo(localProjectTemplateDirectory, checkout);
    return localProjectTemplateDirectory;
  } else if (
    FileSystem.exists(globalTemplateDirectoryPath) &&
    Git.isGitRepo(globalTemplateDirectoryPath)
  ) {
    updateRepo(globalTemplateDirectoryPath, checkout);
    return globalTemplateDirectoryPath;
  } else if (argv.install) {
    return await install(from, argv, true);
  } else {
    let answers = await inquirer.prompt<{ install: boolean }>([
      {
        type: "confirm",
        name: "install",
        message: `${from} template is not installed. Install?`,
        default: true
      }
    ]);

    if (answers.install) {
      return await install(from, argv, true);
    } else {
      process.exit(1);
    }
  }
}

function updateRepo(localPath: string, checkout: string) {
  console.log(Git.updateGitRepo(localPath, checkout));
  Npm.install(localPath);
}

async function install(from: string, argv: ParsedArgs, global: boolean) {
  return await installCommand(
    Object.assign({}, argv, {
      _: ["install", from],
      global: global
    })
  );
}
