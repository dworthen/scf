import { validate } from "@dworthen/bycontract";
import type { Plugin, PluginPipeline } from '../types';

export function buildPluginPipeline(plugins: Plugin[] = []): PluginPipeline {
  validate([plugins], ["Array.<Function>"]);

  let currentPipelineStart: PluginPipeline = async f => f;

  for (let i = plugins.length - 1; i >= 0; i--) {
    currentPipelineStart = plugins[i].bind(null, currentPipelineStart);
  }

  return currentPipelineStart;
}
