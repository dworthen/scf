const path = require("path");
const shell = require("shelljs");
const globalTemplatesPath = require("./globalPath");

module.exports = (args, options, logger) => {
  let link = new Link(args.src, args.as, options, logger);
};

class Link {
  constructor(src, dest, options, logger) {
    this.logger = logger;
    this.options = options;
    this.src = path.resolve(src);
    this.cwd = shell.pwd().toString();

    this.templateName = (dest || this.cwd).split(path.sep);
    this.templateName = this.templateName[this.templateName.length - 1];

    this.template = path.resolve(globalTemplatesPath, this.templateName);

    if (shell.test("-e", this.template) && !this.options.force) {
      this.logger.info({
        Error: `${
          this.template
        } already exist. Run with --force to overwrite existing link.`
      });
      return;
    }

    this.logger.info({
      info: `Linking ${this.template}.`
    });

    shell.ln("-sf", this.src, this.template);
  }
}
