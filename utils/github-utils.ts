import { Octokit } from "octokit";
import { COMMENT_HEADER } from "./pr-comment";

export class GithubUtils {
  repo: string;
  owner: string;
  octokit: Octokit;

  constructor(repo: string, owner: string, githubToken: string) {
    this.repo = repo;
    this.owner = owner;
    this.octokit = new Octokit({ auth: githubToken });
  }

  async updateComment(commentId: number, body: string): Promise<void> {
    const payload = {
      repo: this.repo,
      owner: this.owner,
      comment_id: commentId,
      body,
    };
    await this.octokit.rest.issues.updateComment(payload);
  }

  async comment(prId: number, body: string): Promise<void> {
    const payload = {
      repo: this.repo,
      owner: this.owner,
      issue_number: prId,
      body,
    };
    await this.octokit.rest.issues.createComment(payload);
  }

  async findOpenPR(branch: string) {
    const { data } = await this.octokit.rest.pulls.list({
      repo: this.repo,
      owner: this.owner,
      head: `${this.owner}:${branch}`,
      state: "open",
    });
    return data.length ? data[0] : null;
  }

  async getDefaultBranch() {
    const { data } = await this.octokit.rest.repos.get({
      owner: this.owner,
      repo: this.repo,
    });
    return data.default_branch;
  }

  async getLastCommit(branch: string): Promise<string> {
    const { data } = await this.octokit.rest.repos.listCommits({
      owner: this.owner,
      repo: this.repo,
      sha: branch,
      per_page: 1,
    });
    return data[0].sha;
  }

  async findPreviousComment(prId: number) {
    const { data } = await this.octokit.rest.issues.listComments({
      repo: this.repo,
      owner: this.owner,
      per_page: 100,
      issue_number: prId,
    });
    const comment = data.find(
      (comment) => comment.body?.startsWith(COMMENT_HEADER),
    );
    return comment ? { id: comment.id, content: comment.body } : undefined;
  }

  async deletePreviousComments(prId: number) {
    const { data } = await this.octokit.rest.issues.listComments({
      repo: this.repo,
      owner: this.owner,
      per_page: 100,
      issue_number: prId,
    });
    return Promise.all(
      data
        .filter((comment) => comment.body?.startsWith(COMMENT_HEADER))
        .map((comment) =>
          this.octokit.rest.issues.deleteComment({
            repo: this.repo,
            owner: this.owner,
            comment_id: comment.id,
          }),
        ),
    );
  }
}
