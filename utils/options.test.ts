import { initProgram } from "./options";
import { vi, describe, it, expect, beforeEach, afterAll } from "vitest";

describe("initProgram", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    vi.resetModules();
    process.env = {
      GITHUB_TOKEN: "__github-token__",
      DRONE_REPO_OWNER: "@getyourguide",
      DRONE_REPO_NAME: "__repo-name__",
      DRONE_BRANCH: "main",
      DRONE_COMMIT_SHA: "123456789",
    };
    process.argv.push("-cp", "./coverage.json");
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("should have default options", () => {
    const options = initProgram();
    expect(options.baseBranch).toEqual(["master", "main"]);
    expect(options.githubToken).toEqual("__github-token__");
    expect(options.owner).toEqual("@getyourguide");
    expect(options.branch).toEqual("main");
    expect(options.commit).toEqual("123456789");
  });
});
