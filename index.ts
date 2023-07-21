#!/usr/bin/env ts-node
import { join } from "path";
import { existsSync, readFileSync } from "fs";
import diff, { JsonSummary } from "coverage-diff";
import { GithubUtils } from "./utils/github-utils";
import { Options, initProgram } from "./utils/options";
import {
  COMMENT_HEADER,
  coverageToMarkdown,
  updateComment,
} from "./utils/pr-comment";

export async function run(): Promise<void> {
  const options: Options = initProgram();
  const rootPath = options.basePath || process.cwd();
  const coveragePath = join(rootPath, options.coveragePath);
  const github = new GithubUtils(
    options.repo,
    options.owner,
    options.githubToken,
  );
  const pullRequest = await github.findOpenPR(options.branch);
  const shortCommitSha = options.commit.substring(0, 7);

  console.info("------------  Coverage Guard  -------------");
  console.info(`Repo: ${options.owner}/${options.repo}`);
  console.info(options.monorepoPath ? `Module: ${options.monorepoPath}` : "");
  console.info(`Branch: ${options.branch} - Commit: ${shortCommitSha}`);
  console.info(`Base branches: ${options.baseBranch.toString()}`);
  console.info(`Coverage file: ${options.coveragePath}`);
  console.info(`Base path: ${rootPath}`);
  console.info("-------------------------------------------\n");

  if (!existsSync(coveragePath)) {
    console.error(
      `[CovergeGuard] The coverage file doesn't exists: ${coveragePath}`,
    );
    process.exit(0);
  }

  const coverageSummary = parseResults(readFileSync(coveragePath, "utf-8"));

  if (options.baseBranch.includes(options.branch)) {
    console.info(
      "[CovergeGuard] We are in a base branch, let's upload the coverage",
    );
    // TODO
  } else {
    console.info(
      "[CovergeGuard] We are in a feature branch, let's compare the coverage",
    );
    const baseBranch =
      pullRequest?.base.ref || (await github.getDefaultBranch());
    const baseSummary = await baseBranchSummary(
      options.repo,
      baseBranch,
      options.monorepoPath,
    );
    const difference = diff(baseSummary || {}, coverageSummary, {
      customFormatter: coverageToMarkdown(
        options.monorepoPath,
        !!baseSummary,
        baseBranch,
      ),
    });

    if (pullRequest && options.createComment) {
      console.info(
        "[CovergeGuard] We found an open PR for the branch, let's create a comment",
      );
      const comment = await github.findPreviousComment(pullRequest.number);
      if (comment && comment.content) {
        const newComment = updateComment(
          comment.content,
          difference.results,
          options.monorepoPath,
        );
        await github.updateComment(comment.id, newComment);
      } else {
        await github.comment(
          pullRequest.number,
          COMMENT_HEADER + difference.results,
        );
      }
      console.info(
        `[CovergeGuard] Added the results to the PR :)\nLink: ${pullRequest.html_url}`,
      );
    } else {
      console.info(
        `[CovergeGuard] No open PR for branch: ${options.branch}. Printing difference here:`,
      );
      console.table(difference.diff.total);
    }
  }
}

export async function baseBranchSummary(
  repo: string,
  branch: string,
  monorepoPath: string,
): Promise<JsonSummary | undefined> {
  try {
    return parseResults("{}");
  } catch (err) {
    console.error(
      `[CovergeGuard] Couldn't find the coverage summary in the S3 bucket`,
    );
    console.error(
      "[CovergeGuard] We can't create a comparison. We will just print the results",
    );
  }
}

function parseResults(resultsFile: string): JsonSummary {
  try {
    return JSON.parse(resultsFile);
  } catch (error) {
    console.error(`[CovergeGuard] Error parsing the coverage file.`);
    console.error(error);
    process.exit(0);
  }
}

run();
