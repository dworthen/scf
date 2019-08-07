const fs = require("fs");
const findUp = require("find-up");
const globalTemplatesPath = require("./globalPath");

module.exports = (args, options, logger) => {
  let list = new List(options, logger);
  list.list();
};

class List {
  constructor(options, logger) {
    this.logger = logger;
    this.options = options;
    this.templates = [];
    this.localTemplatesPath =
      findUp.sync(this.options.templatesDirectory, { type: "directory" }) ||
      ".scf";

    try {
      this.templates = fs.readdirSync(
        this.options.global ? globalTemplatesPath : this.localTemplatesPath
      );
    } catch {}
  }

  list() {
    this.logger.info();
    this.logger.info("Templates:");
    this.logger.info();
    if (!this.templates.length) {
      this.logger.info(
        `No ${this.options.global ? "global" : "local"} templates found`
      );
    }
    for (const template of this.templates) {
      this.logger.info(`${template}`);
    }
  }
}
