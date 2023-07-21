import { FileResultFormat, FilesResults } from "coverage-diff/lib/common";
import {
  SECTION_END,
  SECTION_START,
  coverageToMarkdown,
  updateComment,
} from "./pr-comment";
import { describe, it, expect } from "vitest";

const totals = {
  pcts: {
    branches: 10,
    functions: 10,
    statements: 10,
    lines: 10,
  },
  deltas: {
    branches: 5,
    functions: 5,
    statements: 5,
    lines: 5,
  },
} as FileResultFormat;

const totalsNoDeltas = {
  pcts: {
    branches: 10,
    functions: 10,
    statements: 10,
    lines: 10,
  },
  deltas: {
    branches: 0,
    functions: 0,
    statements: 0,
    lines: 0,
  },
} as FileResultFormat;

const files: FilesResults = {
  "path/package/file.ts": {
    decreased: false,
    belowThreshold: false,
    isNewFile: false,
    pcts: {
      branches: 10,
      functions: 10,
      statements: 10,
      lines: 10,
    },
    deltas: {
      branches: 5,
      functions: 5,
      statements: 5,
      lines: 5,
    },
  },
};

describe("PR Comment util", () => {
  it("should generate results with base branch coverage", async () => {
    const resultsFn = coverageToMarkdown("path/package", true, "main");
    expect(resultsFn(files, totals)).toMatchSnapshot();
  });
  it("should generate results without base branch coverage", async () => {
    const resultsFn = coverageToMarkdown("path/package", false, "main");
    expect(resultsFn(files, totals)).toMatchSnapshot();
  });
  it("should generate results without coverage difference", async () => {
    const resultsFn = coverageToMarkdown("path/package", false, "main");
    expect(resultsFn(files, totalsNoDeltas)).toMatchSnapshot();
  });
  it("should update current comment", async () => {
    let oldComment = "KEEP COMMENT\n";
    oldComment += SECTION_START("");
    oldComment += "\nREPLACE TEXT";
    oldComment += SECTION_END;
    oldComment += "\nKEEP COMMENT";
    const newComment = updateComment(oldComment, "NEW SECTION", "");
    expect(newComment).toEqual("KEEP COMMENT\nNEW SECTION\nKEEP COMMENT");
  });
});
