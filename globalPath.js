const homeOrTmp = require("home-or-tmp");
const path = require("path");
const shell = require("shelljs");

const globalTemplatesPath = path.resolve(homeOrTmp, ".scf");

shell.mkdir("-p", globalTemplatesPath);

module.exports = globalTemplatesPath;
