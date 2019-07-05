const path = require("path");
const shell = require("shelljs");
const findUp = require("find-up");
const degit = require("degit");
const globalTemplatesPath = require("./globalPath");

module.exports = (args, options, logger) => {
  let install = new Install(options, logger);
  let as = args.as;

  if (as === null) {
    let template = args.src.split("/");
    as = template[template.length - 1];
  }

  install.install(args.src, as);
};

class Install {
  constructor(options, logger) {
    this.logger = logger;
    this.options = options;
    this.localTemplatesPath = findUp.sync(this.options.templatesDirectory);
  }

  install(src, as) {
    let dest = path.resolve(
      this.options.global ? globalTemplatesPath : this.localTemplatesPath,
      as
    );

    if (shell.test("-e", dest) && !this.options.force) {
      this.logger.info({
        Error: `${dest} already exist. Run with --force to overwrite existing link.`
      });
      return;
    }

    const emitter = degit(src, {
      cache: false,
      force: true,
      verbose: true
    });

    emitter.on("info", info => {
      this.logger.debug({
        debug: info.message
      });
    });

    emitter.clone(dest).then(() => {
      this.logger.info({
        info: `Finished installing ${src} to ${dest}`
      });
    });
  }
}
