#!/usr/bin/env node

const version = require("../package.json").version;
const prog = require("caporal");
const scf = require("../index.js");

prog
  .version(version)
  .command("create", "Scaffold code")
  .argument("<name>", "Name of template to scaffold.")
  .argument(
    "[templates-directory]",
    "Directory where templates are stored.",
    undefined,
    "./templates"
  )
  .action(scf);

prog.parse(process.argv);
