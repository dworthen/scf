#!/usr/bin/env node

const version = require("../package.json").version;
const prog = require("caporal");
const scf = require("../index.js");
const link = require("../link");

prog
  .version(version)
  .command("create", "Scaffold code")
  .argument("<name>", "Name of template to scaffold.")
  .option(
    "--templates-directory [templates-directory]",
    "Directory where templates are stored.",
    undefined,
    "templates"
  )
  .option("-f, --force", "overwrite existing files", prog.BOOLEAN, false)
  .option(
    "--flatten",
    "Scaffold out files in flat directory structure",
    prog.BOOLEAN,
    false
  )
  .action(scf);

prog
  .command("link", "Link current directory to global templates directory")
  .argument("[src]", "Source directory", undefined, ".")
  .argument("[as]", "Global Template name", undefined, null)
  .option("-f, --force", "overwrite existing link", prog.BOOLEAN, false)
  .action(link);

prog.parse(process.argv);
