const shell = require("shelljs");

module.exports = (args, options, logger) => {
  let init = new Init(options, logger);
  init.init(options.templatesDirectory);
};

class Init {
  constructor(options, logger) {
    this.logger = logger;
    this.options = options;
  }

  init(dir) {
    this.logger.info();
    shell.mkdir("-p", dir);
    this.logger.info({
      info: `Created ${dir}`
    });
  }
}
