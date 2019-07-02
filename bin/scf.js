#!/usr/bin/env node

const version = require("../package.json").version;
const prog = require("caporal");
const scf = require("../index");
const init = require("../init");
const link = require("../link");
const list = require("../list");
const install = require("../install");

prog
  .version(version)
  .command("create", "Scaffold out template")
  .argument("<name>", "Name of template to scaffold.")
  .option(
    "-t, --templates-directory [templates-directory]",
    "Local directory where templates are stored.",
    undefined,
    ".scf-templates"
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
  .command("init", "Initialize scf template directory")
  .option(
    "-t, --templates-directory [templates-directory]",
    "Local directory where templates are stored.",
    undefined,
    ".scf-templates"
  )
  .action(init);

prog
  .command("install", "Install template")
  .argument("<src>", "Template to install")
  .argument("[as]", "Template name", undefined, null)
  .option("-f, --force", "overwrite existing template", prog.BOOLEAN, false)
  .option(
    "-t, --templates-directory [templates-directory]",
    "Local directory where templates are stored.",
    undefined,
    ".scf-templates"
  )
  .option(
    "-g, --global",
    "List globally installed templates",
    prog.BOOLEAN,
    false
  )
  .action(install);

prog
  .command("list", "List available templates")
  .option(
    "-t, --templates-directory [templates-directory]",
    "Local directory where templates are stored.",
    undefined,
    ".scf-templates"
  )
  .option(
    "-g, --global",
    "List globally installed templates",
    prog.BOOLEAN,
    false
  )
  .action(list);

prog
  .command("link", "Link current directory to global templates directory")
  .argument("[src]", "Source directory", undefined, ".")
  .argument("[as]", "Global Template name", undefined, null)
  .option("-f, --force", "overwrite existing link", prog.BOOLEAN, false)
  .action(link);

prog.parse(process.argv);
