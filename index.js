const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const prompt = require("inquirer").prompt;
const template = require("es6-template-strings");
const frontMatter = require("yaml-front-matter");
const findUp = require("find-up");
const globalTemplatesPath = require("./globalPath");
const operators = require("./operators");
const ignore = require("ignore");
const install = require("./install");

shell.config.silent = true;

const filenamePrompt = {
  name: "filename",
  message: "filename (with extension)"
};

module.exports = async (args, options, logger) => {
  logger.debug({ debug: "Command arguments:" });
  logger.debug(args);
  logger.debug({ debug: "Command options:" });
  logger.debug(options);

  const scaffolder = new Scaffolder(args, options, logger);

  await scaffolder.setup();

  await scaffolder.processGlobals();

  await scaffolder.scaffold();
};

class Scaffolder {
  constructor(args, options, logger) {
    this.debug = options.verbose;
    this.args = args;
    this.options = options;
    this.logger = logger;
    this.cwd = path.join(shell.pwd().toString(), args.as);
    this.globals = {};
    this.filesMetaData = [];
    this.fileMappings = {};
    this.templatesDirectory = "";

    this.localTemplatesPath = findUp.sync(this.options.templatesDirectory);
    this.globalTemplatesPath = globalTemplatesPath;
  }

  async setup() {
    this.templatesDirectory = path.resolve(
      this.localTemplatesPath,
      this.args.name
    );

    if (!shell.test("-e", this.templatesDirectory)) {
      this.templatesDirectory = path.resolve(
        this.globalTemplatesPath,
        this.args.name
      );
      if (!shell.test("-e", this.templatesDirectory)) {
        let templateName = this.args.name.split("/").reduce((acc, cur) => cur);
        this.templatesDirectory = path.resolve(
          this.globalTemplatesPath,
          templateName
        );

        await install(
          { src: this.args.name, as: null },
          {
            global: true,
            force: true,
            templatesDirectory: this.options.templatesDirectory
          },
          this.logger
        ).catch(err => {
          throw err;
        });

        if (!shell.test("-e", this.templatesDirectory)) {
          throw new Error(`Cannot find template ${this.args.name}`);
        }
      }
    }

    this.logger.debug({
      debug: `Templates directory: ${this.templatesDirectory}`
    });

    this.globalPromptsFile = "globals.{yml,yaml,json}";

    this.logger.debug({
      debug: `Global prompts file: ${this.globalPromptsFile}`
    });

    this.filesToScaffold = this.filterFiles(
      shell.ls("-RA", this.templatesDirectory)
    );

    this.logger.debug({
      debug: `Files to scaffold ${JSON.stringify(
        this.filesToScaffold,
        undefined,
        2
      )}`
    });
  }

  filterFiles(paths) {
    let filesToIgnore = ["globals.*", ".scfignore"];
    let packageJsonPath = path.resolve(this.templatesDirectory, "package.json");
    let scfIgnorePath = path.resolve(this.templatesDirectory, ".scfignore");
    let ig = ignore().add(filesToIgnore);

    if (scfIgnorePath && shell.test("-e", scfIgnorePath)) {
      ig.add(this.readFile(scfIgnorePath));
    }

    if (packageJsonPath && shell.test("-e", packageJsonPath)) {
      try {
        let contents = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        ig.add(contents.scfignore || []);
      } catch (err) {
        this.logger.debug({
          debug: `Unable to read ${packageJsonPath}. ${err.message}`
        });
      }
    }

    return ig.filter(paths);
  }

  async processGlobals() {
    let globalFiles = shell.ls(
      path.resolve(this.templatesDirectory, this.globalPromptsFile)
    );
    for (const file of globalFiles) {
      let fullTemplatesPath = path.resolve(this.templatesDirectory, file);
      if (shell.test("-e", fullTemplatesPath)) {
        this.logger.info({
          info: `Loading global prompts from ${this.globalPromptsFile}.`
        });

        let contents = this.readFile(fullTemplatesPath);
        if (!/^---\n/.test(contents)) {
          contents = `---\n${contents.trim()}\n---`;
        }
        let fileMetaData = this.parseYamlFront(
          this.globalPromptsFile,
          contents
        );

        this.globals = await this.promptInput(fileMetaData.prompts);

        this.logger.debug({
          debug: `Answers for ${file}: ${JSON.stringify(
            this.globals,
            undefined,
            2
          )}`
        });

        return;
      }
    }
    this.logger.info({
      info: `No global prompts file exists.`
    });
  }

  readFile(fullFilePath) {
    this.logger.debug({ debug: `Reading ${fullFilePath}.` });
    return fs.readFileSync(fullFilePath, "utf8");
  }

  buildPrompt(prompt) {
    if (prompt.pattern) {
      prompt.pattern =
        typeof prompt.pattern == "string"
          ? new RegExp(prompt.pattern)
          : prompt.pattern;
      if (!prompt.pattern instanceof RegExp) {
        throw new TypeError(
          `Pattern must be string|RegExp but recieved ${typeof prompt.pattern}.`
        );
      }
      prompt.validate = function(input) {
        return (
          prompt.pattern.test(input) ||
          `${input} does nto satisfy ${prompt.pattern}`
        );
      };
    }
    return prompt;
  }

  parseYamlFront(file, fileContents) {
    fileContents =
      fileContents ||
      this.readFile(path.resolve(this.templatesDirectory, file));

    this.logger.debug({
      debug: `Parsing Yaml Front for ${file}`
    });

    let fm = frontMatter.loadFront(fileContents);
    let yaml = [].concat(fm);
    yaml.__content = fm.__content;

    let fileMetaData = {
      src: file,
      dest: "",
      filename:
        yaml.filter(p => p.filename !== undefined).map(f => f.filename)[0] ||
        "",
      prompts: yaml.filter(p => p.name !== undefined).map(this.buildPrompt),
      skip: yaml.filter(p => p.skip !== undefined).map(f => f.skip)[0] || false,
      conditions: yaml.filter(p => p.conditions !== undefined),
      contents: yaml && yaml.__content ? yaml.__content : ""
    };

    fileMetaData.dest = path
      .join(path.dirname(fileMetaData.src), fileMetaData.filename)
      .replace(/\\/gi, "/");

    this.logger.debug({
      debug: `File meta data for ${file}: ${JSON.stringify(
        fileMetaData,
        undefined,
        2
      )}`
    });

    return fileMetaData;
  }

  shouldSkip(fileMetaData) {
    return fileMetaData.skip || !this.meetsConditions(fileMetaData);
  }

  meetsConditions(fileMetaData) {
    const { src, conditions } = fileMetaData;
    if (!Array.isArray(conditions)) {
      throw new TypeError(
        `Expecting conditions to be an array but got ${typeof conditions}.`
      );
    }

    let passes = !conditions.length
      ? true
      : conditions.reduce((accumulator, condition) => {
          let andResult = condition.conditions.reduce((acc, con) => {
            let results = acc;
            if (!operators[con.operator](this.globals[con.name], con.value)) {
              results = false;
            }
            this.logger.debug({
              debug: `${con.name} with value of ${
                con.value
              } results in ${results} for ${con.operator}`
            });
            return results;
          }, true);
          return andResult || accumulator;
        }, false);

    this.logger.debug({
      debug: `${src} ${passes} all conditions.`
    });

    return passes;
  }

  promptInput(prompts, showInfo = false) {
    if (showInfo) {
      this.logger.info(`Prompts for ${file}`);
    }

    if (!Array.isArray(prompts)) {
      throw new TypeError(
        `Prompts must be an array. Received ${typeof prompts}`
      );
    }

    return prompt(prompts);
  }

  processDirectory(dir) {
    let fullPath = path.resolve(this.cwd, dir);
    if (!shell.test("-d", fullPath)) {
      shell.mkdir("-p", fullPath);
      this.logger.info({ info: `Done scaffolding "${dir}/"` });
    } else {
      this.logger.info({
        info: `Skip scaffolding "${dir}/". Directory already exists.`
      });
    }
  }

  async processFile(file) {
    let fullTemplatesPath = path.resolve(this.templatesDirectory, file);

    let fileContents = this.readFile(fullTemplatesPath);
    let fileMetaData = this.parseYamlFront(file, fileContents);

    if (this.shouldSkip(fileMetaData)) {
      this.logger.debug({
        debug: `skipping ${file} as skip is set to true or conditions were not met`
      });
      return;
    }

    if (!shell.test("-e", fullTemplatesPath)) {
      throw new Error(`Cannot locate ${fullTemplatesPath}`);
    }

    this.logger.info({
      info: `Scaffolding "${file}".`
    });

    const { filename } = fileMetaData;
    if (!filename || filename === "") {
      let newName = "";
      if (!this.options.skipFilenames) {
        newName = (await this.promptInput([filenamePrompt])).filename;
      } else {
        newName = path.basename(fileMetaData.src);
      }
      if (!newName || newName === "") {
        this.logger.info({
          info: `Skip scaffolding ${file} as a filename was not provided.`
        });
        return;
      }
      fileMetaData.filename = newName;
      fileMetaData.dest = path
        .join(path.dirname(fileMetaData.src), fileMetaData.filename)
        .replace(/\\/gi, "/");
    }

    let fullDestinationPath = path.resolve(this.cwd, fileMetaData.dest);

    if (shell.test("-e", fullDestinationPath) && !this.options.force) {
      throw new Error(
        `${file} already exists. Run with --force to overwrite existing files`
      );
    }

    fileMetaData.promptAnswers = await this.promptInput(fileMetaData.prompts);

    this.logger.debug({
      debug: `Answers for ${file}: ${JSON.stringify(
        fileMetaData.promptAnswers,
        undefined,
        2
      )}`
    });

    this.generateTemplateData(fileMetaData);
  }

  generateTemplateData(fileMetaData) {
    const { src, dest } = fileMetaData;

    let templateData = {
      ...this.globals,
      ...{
        src: src,
        dest: dest
      },
      ...{
        __path: path.parse(dest)
      },
      ...fileMetaData.promptAnswers
    };

    templateData.__path.dir = templateData.__path.dir.replace(/\\/gi, "/");

    fileMetaData.templateData = templateData;

    this.fileMappings[src] = {
      src: src,
      dest: dest,
      __path: templateData.__path
    };

    this.filesMetaData.push(fileMetaData);

    this.logger.debug({
      debug: `Template data for ${src}: ${JSON.stringify(
        templateData,
        undefined,
        2
      )}`
    });
  }

  createFiles() {
    this.logger.debug({
      debug: `Files metadata: ${JSON.stringify(
        this.filesMetaData,
        undefined,
        2
      )}`
    });

    this.logger.debug({
      debug: `file mappings: ${JSON.stringify(this.fileMappings, undefined, 2)}`
    });

    let dirs = {};

    for (const fileMetaData of this.filesMetaData) {
      let {
        templateData: {
          __path: { dir }
        }
      } = fileMetaData;
      if (dir !== "" && !dirs[dir]) {
        this.processDirectory(dir);
      }
      fileMetaData.templateData = {
        ...fileMetaData.templateData,
        ...{ files: this.fileMappings }
      };

      this.logger.debug({
        debug: `Updated file meta data: ${JSON.stringify(
          fileMetaData,
          undefined,
          2
        )}`
      });

      let content = template(
        fileMetaData.contents || "",
        fileMetaData.templateData
      );

      this.logger.debug({
        debug: `file contents for ${fileMetaData.templateData.dest}: ${content}`
      });

      fs.writeFileSync(
        path.resolve(this.cwd, fileMetaData.templateData.dest),
        content.trim(),
        "utf8"
      );

      this.logger.info({
        info: `Done scaffolding ${fileMetaData.templateData.dest}`
      });
    }
  }

  async scaffold() {
    for (const file of this.filesToScaffold) {
      let fullTemplatesPath = path.resolve(this.templatesDirectory, file);
      let fullDestinationPath = path.resolve(
        this.cwd,
        path.basename(file, ".tmpl")
      );
      if (shell.test("-f", fullTemplatesPath)) {
        this.logger.debug({
          debug: `scaffolding ${fullTemplatesPath} to ${fullDestinationPath}`
        });
        await this.processFile(file);
      }
    }
    this.createFiles();
  }
}
