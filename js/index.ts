import { resolve } from 'node:path'
import { wrapBin } from '@d-dev/archive-downloader'

import type { BinReturn as B } from '@d-dev/archive-downloader'

export type BinReturn = B

export const runScf: (...args: string[]) => Promise<BinReturn> = wrapBin(
  resolve(__dirname, '../bin-js/scf'),
)
