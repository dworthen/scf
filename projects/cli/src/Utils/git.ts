import { Executable, FileSystem } from "@microsoft/node-core-library";
import path from "path";

// TODO: Check that repo path exists first

export function clone(remoteRepo: string, localRepo: string) {
  const cwd = process.cwd();
  process.chdir(localRepo);

  const result = Executable.spawnSync("git", ["clone", remoteRepo, localRepo]);

  process.chdir(cwd);
  return result;
}

export function fetch(localRepo: string) {
  const cwd = process.cwd();
  process.chdir(localRepo);

  const result = Executable.spawnSync("git", ["fetch", "--all"]);

  process.chdir(cwd);
  return result;
}

export function pull(localRepo: string) {
  const cwd = process.cwd();
  process.chdir(localRepo);

  const result = Executable.spawnSync("git", ["pull"]);

  process.chdir(cwd);
  return result;
}

export function isDetached(localRepo: string) {
  const cwd = process.cwd();
  process.chdir(localRepo);
  let detachedState = Executable.spawnSync("git", [
    "symbolic-ref",
    "-q",
    "HEAD"
  ]);
  process.chdir(cwd);
  return detachedState.status !== 0;
}

export function isGitRepo(localRepo: string) {
  return FileSystem.exists(path.join(localRepo, ".git/"));
}

export function checkout(localRepo: string, checkout: string) {
  const cwd = process.cwd();
  process.chdir(localRepo);

  checkout = checkout || "master";
  let checkoutResult = Executable.spawnSync("git", ["checkout", checkout]);

  process.chdir(cwd);
  return checkoutResult;
}

export function parseShorthandGithubRepoPath(
  shortHandRepoPath: string
): [string, string] {
  let repoDetails = shortHandRepoPath.split(/\/|\\/g);

  // TODO: validate length

  let githubUrl = "https://github.com";
  let [user, repoAndCheckout] = repoDetails;
  let [repo, checkout] = parseCheckoutHash(repoAndCheckout);

  return [`${githubUrl}/${user}/${repo}.git`, checkout];
}

export function parseCheckoutHash(repoAndCheckout: string) {
  let repo = repoAndCheckout;
  let checkout = "";
  let hashLocation = repoAndCheckout.indexOf("#");
  if (hashLocation > -1) {
    repo = repoAndCheckout.substring(0, hashLocation);
    checkout = repoAndCheckout.substring(hashLocation + 1);
  }
  return [repo, checkout];
}

export function updateGitRepo(localRepo: string, specificCheckout: string) {
  let output = [];

  output.push(fetch(localRepo));

  output.push(checkout(localRepo, specificCheckout));
  if (!isDetached(localRepo)) {
    output.push(pull(localRepo));
  }
  return output;
}
