import { ConfigOptions } from "coverage-diff";
import { FileResultFields, FileResultFormat } from "coverage-diff/lib/common";

type CustomFormatter = NonNullable<ConfigOptions["customFormatter"]>;

export const COMMENT_HEADER = "## 👮 Coverage Guard\n";
export const SECTION_START = (pathInMonorepo: string) =>
  `### ${pathInMonorepo || "Status:"}`;
export const SECTION_END = "\r\r";

export const coverageToMarkdown = (
  pathInMonorepo: string,
  baseCoverageFound: boolean,
  baseBranch: string,
) => {
  const customFormatter: CustomFormatter = (files, totals) => {
    let comment = "";
    comment += `${SECTION_START(pathInMonorepo)} ${
      coverageWithChanges(totals.deltas)
        ? (!baseCoverageFound && "🟡") || (totals.decreased ? " 🔴" : " 🟢")
        : ""
    }`;
    comment += "\n";
    comment += !baseCoverageFound
      ? `We couldn't find the coverage results for \`${baseBranch}\`, so we can't compare.\nPrinting the results of current changes.\n`
      : "";
    comment += "\n";
    if (coverageWithChanges(totals.deltas)) {
      comment += "| Lines | Statements     | Branches | Functions    |\n";
      comment += "| ----- | -------------- | -------- | ------------ |\n";
      comment += `|  ${totals.pcts.lines}% ${diffNumber(
        totals.deltas.lines,
        baseCoverageFound,
      )} |  ${totals.pcts.statements}% ${diffNumber(
        totals.deltas.statements,
        baseCoverageFound,
      )} |  ${totals.pcts.branches}% ${diffNumber(
        totals.deltas.branches,
        baseCoverageFound,
      )} |  ${totals.pcts.functions}% ${diffNumber(
        totals.deltas.functions,
        baseCoverageFound,
      )} |`;
      if (baseCoverageFound) {
        comment += "\n\n<details>\n";
        comment += "<summary>Details</summary>\n\n";
        comment +=
          "| File    | Lines  | Statements  | Branches   | Functions  |\n";
        comment +=
          "| ------- | ------ | ----------- | ---------- | ----------- |\n";
        comment += Object.keys(files)
          .map((file) => {
            return tableRow(
              file,
              files[file],
              pathInMonorepo,
              baseCoverageFound,
            );
          })
          .toString();
        comment += "\n\n</details>";
      }
    } else {
      comment += "No changes :)";
    }
    comment += SECTION_END;
    return comment;
  };
  return customFormatter;
};

const coverageWithChanges = (deltas: FileResultFields) => {
  const { lines, statements, branches, functions } = deltas;
  return [branches, statements, lines, functions].some((value) => value !== 0);
};

export const diffNumber = (number: number, print = true) => {
  return print ? `**(${number > 0 ? `+${number}` : number}%)**` : "";
};

export const updateComment = (
  oldComment: string,
  update: string,
  pathInMonorepo: string,
) => {
  if (oldComment.includes(SECTION_START(pathInMonorepo))) {
    const replaceRegex = new RegExp(
      `(${SECTION_START(pathInMonorepo)}[\\s\\S]*?)${SECTION_END}`,
    );
    return oldComment.replace(replaceRegex, update);
  }
  return oldComment + update;
};

const tableRow = (
  file: string,
  diff: FileResultFormat,
  pathInMonorepo: string,
  printDifference: boolean,
) => {
  const fileName = file.substring(
    file.indexOf(pathInMonorepo) + pathInMonorepo.length + 1,
  );
  return `|  ${fileName} | ${diff.pcts.lines}% ${diffNumber(
    diff.deltas.lines,
    printDifference,
  )} | ${diff.pcts.statements}% ${diffNumber(
    diff.deltas.statements,
    printDifference,
  )} | ${diff.pcts.branches}% ${diffNumber(
    diff.deltas.branches,
    printDifference,
  )} | ${diff.pcts.functions}% ${diffNumber(
    diff.deltas.functions,
    printDifference,
  )} |`;
};
