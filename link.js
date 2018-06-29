const path = require("path");
const shell = require("shelljs");

module.exports = (args, options, logger) => {
  let link = new Link(args.src, args.as, logger);
};

class Link {
  constructor(src, dest, options, logger) {
    this.logger = logger;
    this.options = options;
    this.src = path.resolve(src);
    this.cwd = shell.pwd().toString();
    this.globalTemplatesPath = path.resolve(__dirname, "./templates");

    this.templateName = (dest || this.cwd).split(path.sep);
    this.templateName = this.templateName[this.templateName.length - 1];

    this.template = path.resolve(this.globalTemplatesPath, this.templateName);

    shell.mkdir("-p", this.globalTemplatesPath);
    shell.ln("-s", this.src, this.template);
  }
}
