const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const prompt = require("inquirer").prompt;
const template = require("es6-template-strings");
const frontMatter = require("yaml-front-matter");
const findUp = require("find-up");

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
  scaffolder.globals = await scaffolder.prompt(
    scaffolder.globalsPath,
    scaffolder.globals
  );
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
    this.globalTemplatesPath = path.resolve(__dirname, "./templates");
    this.localTemplatesPath = findUp.sync(templateDir);

    this.template = this.localTemplatesPath
      ? path.resolve(this.localTemplatesPath, templateName)
      : path.resolve(this.globalTemplatesPath, templateName);

    logger.debug({ debug: "template directories:" });
    logger.debug({ globalTemplatesPath: this.globalTemplatesPath });
    logger.debug({ localTemplatesPath: this.localTemplatesPath });
    logger.debug({ template: this.template });

    if (!shell.test("-d", path.resolve(this.template))) {
      throw new Error(`${this.template} does not exist or is not a directory.`);
    }

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
        _filename: path.basename(filePath, ".tmpl")
      },
      fileData
    );
    fileData._filePath = path.resolve(
      this.cwd,
      path.relative(
        this.template,
        path.join(path.dirname(filePath), fileData._filename)
      )
    );
    fileData._ext = path.extname(fileData._filename);
    fileData._basename = path.basename(fileData._filename, fileData._ext);
    this.logger.debug({ debug: `File data for ${fileData._filePath}` });
    this.logger.debug(fileData);
    return fileData;
  }

  copyFile(fileData) {
    this.logger.info({ info: `Creating ${fileData._filePath}` });
    let content = fileData.__content || "";
    delete fileData.__content;
    content = template(content, fileData);
    fs.writeFileSync(fileData._filePath, content.trim(), "utf8");
  }

  async scaffold() {
    const files = shell.ls("-R", this.template);
    for (const file of files) {
      if (/globals.(ya?ml|json)$/i.test(file)) continue;
      const filePath = path.join(this.template, file);
      if (shell.test("-d", filePath)) {
        this.copyDirectory(path.relative(this.template, filePath));
      }

      if (shell.test("-f", filePath)) {
        const fileContents = this.readFile(filePath);
        let questions = this.parseFile(filePath, fileContents);
        let content = questions.__content;
        delete questions.__content;
        let fileData = await this.prompt(filePath, questions);
        fileData.__content = content;
        fileData = this.generateFileData(filePath, fileData);
        this.copyFile(fileData);
      }
    }
  }
}
