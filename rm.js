const path = require("path");
const shell = require("shelljs");
const findUp = require("find-up");
const degit = require("degit");
const globalTemplatesPath = require("./globalPath");

module.exports = async (args, options, logger) => {
  let rm = new Remove(options, logger);

  rm.remove(args.name);
};

class Remove {
  constructor(options, logger) {
    this.logger = logger;
    this.options = options;
    this.localTemplatesPath = this.options.templatesDirectory;
  }

  remove(name) {
    let dest = path.resolve(
      this.options.global ? globalTemplatesPath : this.localTemplatesPath,
      name
    );

    if (!shell.test("-e", dest)) {
      this.logger.info({
        info: `Unable to locate ${dest}`
      });
      return;
    }

    shell.rm("-rf", dest);

    this.logger.info({
      info: `${name} successfully removed.`
    });
  }
}
