#!/usr/bin/env node

const { version } = require("../package.json");
const prog = require("caporal");
const scaffold = require("../dist/cjs/scaffold").default;

prog
  .version(version)
  .command("create", "Scaffold out project.")
  .alias("scaffold")
  .default()
  .argument("<name>", "Name of template to scaffold.")
  .argument("[as]", "Name of project directory to create.", undefined, ".")
  .option("-f, --force", "overwrite existing files", prog.BOOLEAN, false)
  .option(
    "-s, --skip-filenames",
    "scaffold out template directory as is without changing filenames.",
    prog.BOOLEAN,
    false
  )
  .option("--ejs", "Use ejs template engine", prog.BOOLEAN, false)
  .option(
    "-t, --templates-directory [templates-directory]",
    "Local directory where templates are stored.",
    undefined,
    ".scf"
  )
  .action(scaffold);

prog.parse(process.argv);
