// eslint-disable-next-line diversity-inclusion/all
import { Command } from "commander";
import packageJson from "../package.json";

export interface Options {
  coveragePath: string;
  basePath?: string;
  githubToken: string;
  owner: string;
  repo: string;
  branch: string;
  commit: string;
  baseBranch: string[];
  monorepoPath: string;
  createComment: boolean;
}

export function initProgram(): Options {
  const program = new Command("coverage-guard");
  program.description(packageJson.description);
  program.requiredOption(
    "-cp --coverage-path <path>",
    "path to coverage json file",
  );
  program.option("-mp --monorepo-path <path>", "path inside the monorepo", "");
  program.requiredOption(
    "-gt --github-token <value>",
    "personal access token for github (default: GITHUB_TOKEN)",
    process.env.GITHUB_TOKEN,
  );
  program.requiredOption(
    "-o --owner <value>",
    "owner or org for the repo (default: DRONE_REPO_OWNER)",
    process.env.DRONE_REPO_OWNER || "@getyourguide",
  );
  program.requiredOption(
    "-r --repo <value>",
    "name of the github repo (default: DRONE_REPO_NAME)",
    process.env.DRONE_REPO_NAME,
  );
  program.requiredOption(
    "-b --branch <value>",
    "current branch (default: DRONE_BRANCH)",
    process.env.DRONE_BRANCH,
  );
  program.requiredOption(
    "-c --commit <value>",
    "sha of the current commit (default: DRONE_COMMIT_SHA)",
    process.env.DRONE_COMMIT_SHA,
  );
  program.option(
    "-bb --base-branch <value>",
    "base branches from where coverage should be upload",
    ["master", "main"],
  );
  program.option("-cc --create-comment", "create a comment for GitHub", true);
  program.option("-bp --base-path <value>", "absolute path to look for files");
  program.parse();
  return program.opts();
}
