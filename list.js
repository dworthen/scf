const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
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
    this.localTemplatesPath = findUp.sync(this.options.templatesDirectory);

    this.templates = fs.readdirSync(
      this.options.global ? globalTemplatesPath : this.localTemplatesPath
    );
  }

  list() {
    this.logger.info();
    this.logger.info("Templates:");
    this.logger.info();
    this.templates.forEach(template => {
      this.logger.info(`${template}`);
    });
  }
}
