#!/usr/bin/env node

const version = require("../package.json").version;
const prog = require("caporal");
const scf = require("../index");
const init = require("../init");
const link = require("../link");
const list = require("../list");
const install = require("../install");
const rm = require("../rm");

prog
  .version(version)
  .command("create", "Scaffold out template")
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
  .action(scf);

prog
  .command("init", "Initialize scf template directory")
  .option(
    "-t, --templates-directory [templates-directory]",
    "Local directory where templates are stored.",
    undefined,
    ".scf"
  )
  .action(init);

prog
  .command("install", "Install template")
  .argument("<src>", "Template to install")
  .argument("[as]", "Template name", undefined, null)
  .option("-f, --force", "overwrite existing template", prog.BOOLEAN, false)
  .option("-g, --global", "Install global templates", prog.BOOLEAN, false)
  .option(
    "-t, --templates-directory [templates-directory]",
    "Local directory where templates are stored.",
    undefined,
    ".scf"
  )
  .action(install);

prog
  .command("rm", "remove template")
  .argument("<name>", "template to remove")
  .option("-g, --global", "remove global template", prog.BOOLEAN, false)
  .option(
    "-t, --templates-directory [templates-directory]",
    "Local directory where templates are stored.",
    undefined,
    ".scf"
  )
  .action(rm);

prog
  .command("list", "List available templates")
  .option("-g, --global", "List global templates", prog.BOOLEAN, false)
  .option(
    "-t, --templates-directory [templates-directory]",
    "Local directory where templates are stored.",
    undefined,
    ".scf"
  )
  .action(list);

prog
  .command("link", "Link current directory to global templates directory")
  .argument("[src]", "Source directory", undefined, ".")
  .argument("[as]", "Global Template name", undefined, null)
  .option("-f, --force", "overwrite existing link", prog.BOOLEAN, false)
  .action(link);

prog.parse(process.argv);
