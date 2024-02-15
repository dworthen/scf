#!/usr/bin/env node
import { execSync } from "node:child_process";
import { runScf } from "./index.js";

function run() {
	console.log(__filename);
	console.log(__dirname);
	const stdout = execSync("npm root -g", { encoding: "utf-8" });
	console.log(stdout);
	console.log(process.env["npm_config_local_prefix"]);
	console.log(process.env["npm_config_prefix"]);
}

void run();
