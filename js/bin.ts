#!/usr/bin/env node

import { runScf } from './index.js'

async function run() {
  const { stdout, stderr } = await runScf(...process.argv.slice(2))
  console.log(stdout)
  if (stderr != null && stderr !== '') {
    console.error(stderr)
  }
}

void run()
