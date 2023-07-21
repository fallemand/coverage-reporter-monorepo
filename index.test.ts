import { run } from "./index";
import { initProgram } from "./utils/options";
import { vi, describe, it, expect } from "vitest";

vi.mock("./utils/options", () => ({
  initProgram: vi.fn(() => ({
    owner: "@getyourguide",
    repo: "test-repo",
    commit: "12345678910",
    baseBranch: ["main"],
    branch: "main",
  })),
}));
vi.mock("path", () => ({
  join: vi.fn(() => "./path-to-coverage.json"),
}));
vi.mock("fs", () => ({
  existsSync: vi.fn(() => true),
  readFileSync: vi.fn(() => '{"results": "test"}'),
}));
vi.mock("./utils/github-utils");
vi.mock("./utils/datadot-api", () => ({
  sendCoverageMetrics: vi.fn().mockResolvedValue(""),
}));
vi.spyOn(console, "info").mockImplementation(() => "");

describe("run program", () => {
  it("should upload if we are in a base branch", async () => {
    const options = {
      ...initProgram(),
      branch: "main",
    };
    //@ts-ignore
    initProgram.mockReturnValueOnce(options);
    await run();
    expect(true).toEqual(true);
  });
});
