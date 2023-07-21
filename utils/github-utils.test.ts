import { GithubUtils } from "./github-utils";
import { Octokit } from "octokit";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("octokit", () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: {
      issues: {
        createComment: vi.fn(),
      },
      pulls: {
        list: vi.fn().mockResolvedValue({ data: [{ pr: "mocked-pr" }] }),
      },
      repos: {
        get: vi
          .fn()
          .mockResolvedValue({ data: { default_branch: "mocked-branch" } }),
      },
    },
  })),
}));

describe("GithubUtils", () => {
  let github: GithubUtils;

  beforeEach(() => {
    github = new GithubUtils("repo", "owner", "token");
  });

  it("should create a new instance with params", () => {
    const github = new GithubUtils("repo", "owner", "token");
    expect(github.repo).toEqual("repo");
    expect(github.owner).toEqual("owner");
    expect(Octokit).toHaveBeenCalledWith({ auth: "token" });
  });

  it("should comment in PR", async () => {
    await github.comment(1, "__COMMENT__");
    expect(github.octokit.rest.issues.createComment).toHaveBeenCalledWith({
      body: "__COMMENT__",
      issue_number: 1,
      owner: "owner",
      repo: "repo",
    });
  });

  it("should findOpenPR", async () => {
    const openPr = await github.findOpenPR("main");
    expect(openPr).toEqual({ pr: "mocked-pr" });
  });

  it("should get default branch", async () => {
    const defaultBranch = await github.getDefaultBranch();
    expect(github.octokit.rest.repos.get).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
    });
    expect(defaultBranch).toEqual("mocked-branch");
  });
});
