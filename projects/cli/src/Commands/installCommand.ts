import type { ParsedArgs } from 'minimist';
import { globalSkafDirectory, Git, Npm } from '../Utils';
import { getAbsoluteProjectRootPath } from '../Config';
import { FileSystem } from '@microsoft/node-core-library';
import path from 'path';


/**
 * TODO: 
 * Local installs should not include .git info nor npm install.
 */

export async function installCommand(argv: ParsedArgs): Promise<string> {
  let [repo, as] = argv._.slice(1);

  let repoPathParts = repo.split(/\/|\\/g);
  const l = repoPathParts.length;
  let shortHandRepoPath = path.join(repoPathParts[l - 2], repoPathParts[l-1]);

  as = as || shortHandRepoPath.replace(/#.*/gi, "");

  let [remote, specificCheckout] = Git.parseShorthandGithubRepoPath(shortHandRepoPath);

  let installPath = argv.global
    ? path.join(globalSkafDirectory, as)
    : path.join(await getAbsoluteProjectRootPath(argv), as);

  
  if(Git.isGitRepo(installPath)) {
    Git.updateGitRepo(installPath, specificCheckout);
  } else if(!FileSystem.exists(installPath)) {
    FileSystem.ensureFolder(installPath);
    console.log(Git.clone(remote, installPath));
    Git.updateGitRepo(installPath, specificCheckout);
  }

  Npm.install(installPath);

  return installPath;
}
