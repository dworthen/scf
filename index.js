const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const prompt = require("inquirer").prompt;
const template = require("es6-template-strings");
const frontMatter = require("yaml-front-matter");
const findUp = require("find-up");
const globalTemplatesPath = require("./globalPath");

shell.config.silent = true;

module.exports = async (args, options, logger) => {
  logger.debug({ debug: "Command arguments:" });
  logger.debug(args);
  logger.debug({ debug: "Command options:" });
  logger.debug(options);

  const scaffolder = new Scaffolder(
    options.templatesDirectory,
    args.name,
    logger,
    options
  );
  if (scaffolder.globals.length) {
    scaffolder.globals = await scaffolder.prompt(
      scaffolder.globalsPath,
      scaffolder.globals
    );
  }
  // delete scaffolder.globals.__content;
  logger.debug({ debug: "Globals:" });
  logger.debug(scaffolder.globals);
  await scaffolder.scaffold();
};

class Scaffolder {
  constructor(templateDir, templateName, logger, options) {
    this.logger = logger;
    this.options = options;

    this.cwd = shell.pwd().toString();
    this.templateName = templateName;
    this.globalTemplatesPath = path.resolve(globalTemplatesPath, templateName);
    this.localTemplatesPath = findUp.sync(templateDir);
    this.localTemplatesPath = this.localTemplatesPath
      ? path.resolve(this.localTemplatesPath, templateName)
      : null;

    this.template =
      this.localTemplatesPath && shell.test("-e", this.localTemplatesPath)
        ? this.localTemplatesPath
        : this.globalTemplatesPath;

    if (!shell.test("-d", this.template) && !shell.test("-L", this.template)) {
      throw new Error(`${this.template} does not exist or is not a directory.`);
    }

    logger.debug({ debug: "template directory:" });
    logger.debug({ templateDir: this.template });

    this.globals = [];
    this.globalsPath = path.resolve(this.template, "globals.{yml,yaml}");

    const globalFiles = shell.ls(path.resolve(this.globalsPath));
    for (const file of globalFiles) {
      if (shell.test("-f", file)) {
        var contents = this.readFile(file);
        if (!/^---\n/.test(contents)) {
          contents = `---\n${contents.trim()}\n---`;
        }
        var fileDataArr = this.parseFile(file, contents);
        this.globals = this.globals.concat(fileDataArr);
      }
    }
  }

  readFile(filePath) {
    this.logger.debug({ debug: `Loading ${filePath}.` });
    return fs.readFileSync(filePath, "utf8");
  }

  parseFile(filePath, contents) {
    this.logger.debug({ debug: `Parsing prompts for ${filePath}` });
    let yamlFront = frontMatter.loadFront(contents);
    let yaml = Array.isArray(yamlFront)
      ? yamlFront
      : yamlFront && yamlFront.prompts
      ? yamlFront.prompts
      : [];

    yaml["__content"] =
      yamlFront && yamlFront.__content ? yamlFront.__content : "";

    yaml.forEach((fileData, ind) => {
      if (fileData.pattern) {
        fileData.pattern =
          typeof fileData.pattern == "string"
            ? new RegExp(fileData.pattern)
            : fileData.pattern;
        if (!fileData.pattern instanceof RegExp) {
          throw new TypeError(
            `${filePath}[${ind}].pattern must be string|RegExp but recieved ${typeof fileData.pattern}.`
          );
        }

        fileData.validate = function(input) {
          return (
            fileData.pattern.test(input) ||
            `${input} does not satisfy ${fileData.pattern}`
          );
        };
      }
      // return fileData;
    });
    return yaml;
  }

  prompt(filePath, questions) {
    this.logger.info({ info: `Prompts for ${filePath}` });
    if (!Array.isArray(questions)) {
      throw new TypeError(
        `Questions must be an array. Received ${typeof questions}`
      );
    }
    return prompt(questions).then(ans => {
      return ans;
    });
  }

  copyDirectory(destinationPath) {
    this.logger.info({ info: `Creating ${destinationPath}.` });
    shell.mkdir("-p", path.resolve(this.cwd, destinationPath));
  }

  generateFileData(filePath, fileData) {
    fileData = Object.assign(
      {},
      this.globals,
      {
        __path: path.parse(filePath)
      },
      fileData
    );

    if (fileData._filename) {
      fileData.__path.base = fileData._filename;
      fileData.__path = path.parse(path.format(fileData.__path));
      delete fileData._filename;
    }

    this.logger.debug({
      debug: `File data for ${path.join(
        fileData.__path.dir,
        fileData.__path.name
      )}`
    });
    this.logger.debug(fileData);
    return fileData;
  }

  copyFile(fileData) {
    let filePath = path.relative(
      this.cwd,
      path.resolve(fileData.__path.dir, fileData.__path.base)
    );
    if (fs.existsSync(filePath) && !this.options.force) {
      this.logger.warn({
        warn: `Skip creating ${filePath} as file already exists. Run with --force to overwrite existing files.`
      });
      return;
    }
    this.logger.info({ info: `Creating ${filePath}` });
    let content = template(fileData.__content || "", fileData);
    // delete fileData.__content;
    fs.writeFileSync(filePath, content.trim(), "utf8");
  }

  async scaffold() {
    const files = shell.ls("-R", this.template);
    for (const file of files) {
      if (/globals.(ya?ml|json)$/i.test(file)) continue;
      const filePath = path.resolve(path.join(this.template, file));
      const localPath = this.options.flatten
        ? path.relative(this.cwd, path.basename(file, ".tmpl"))
        : path.relative(
            this.template,
            path.resolve(
              this.template,
              path.dirname(file),
              path.basename(file, ".tmpl")
            )
          );
      if (shell.test("-d", filePath)) {
        this.copyDirectory(localPath);
      }

      if (shell.test("-f", filePath)) {
        const fileContents = this.readFile(filePath);
        let questions = this.parseFile(filePath, fileContents);
        let content = questions.__content;
        delete questions.__content;
        let fileData = await this.prompt(filePath, questions);
        fileData.__content = content;
        fileData = this.generateFileData(localPath, fileData);
        this.copyFile(fileData);
      }
    }
  }
}
