const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const findUp = require("find-up");
const degit = require("degit");

module.exports = (args, options, logger) => {
  let install = new Install(options, logger);
  let as = args.as;

  if (as === null) {
    let template = args.src.split(path.sep);
    as = template[template.length - 1];
  }

  install.install(args.src, as);
};

class Install {
  constructor(options, logger) {
    this.logger = logger;
    this.options = options;
    this.globalTemplatesPath = path.resolve(__dirname, "./templates");
    this.localTemplatesPath = findUp.sync(this.options.templatesDirectory);

    this.templates = fs.readdirSync(
      this.options.global ? this.globalTemplatesPath : this.localTemplatesPath
    );
  }

  install(src, as) {
    let dest = path.resolve(
      this.options.global ? this.globalTemplatesPath : this.localTemplatesPath,
      as
    );

    const emitter = degit(src, {
      cache: true,
      force: this.options.force,
      verbose: true
    });

    emitter.on("info", info => {
      this.logger.info({
        info: info.message
      });
    });

    emitter.clone(dest).then(() => {
      this.logger.info({
        info: "Done"
      });
    });
  }
}
