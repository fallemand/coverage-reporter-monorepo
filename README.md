# :cop: Coverage Guard

<p>
  <a href="https://drone.gygadmin.com/getyourguide/compass" target="_blank">
    <img src="https://drone.gygadmin.com/api/badges/getyourguide/compass/status.svg?branch=main" alt="build" />
  </a>
  <img src="https://img.shields.io/badge/technologies-Typescript-blue.svg" alt="build" />
  <img src="https://img.shields.io/badge/testing-Jest-blueviolet.svg" alt="build" />
</p>

> Coverage reporter for pull requests with support for Monorepos.\
> Run this CLI in CI, to compare current coverage against the base branch, and report the results in the Github PR.

## Options

      -cp --coverage-path <path>  path to coverage json file
      -mp --monorepo-path <path>  Only for monorepos. Path from the repo root (default: "")
      -gt --github-token <value>  personal access token for github (default: GITHUB_TOKEN)
      -o  --owner <value>         owner or org for the repo (default: DRONE_REPO_OWNER) (default: "@getyourguide")
      -r  --repo <value>          name of the github repo (default: DRONE_REPO_NAME)
      -b  --branch <value>        current branch (default: DRONE_BRANCH)
      -c  --commit <value>        sha of the current commit (default: DRONE_COMMIT_SHA)
      -bb --base-branch <value>   base branches from where coverage should be upload (default: ["master","main"])
      -bp --base-path <value>     absolute path to look for files
      -h, --help                  display help for command

## Example comment

<img width="647" alt="image" src="https://github.com/getyourguide/ts-libs/assets/16105726/e7f87566-1c26-49ca-88d3-e09f0135f730">

## Requirements

In order to use it, you need to setup your test runner to report coverage and produce a `json-summary`.\
Please check the docs of your test runner.

### Jest

```ts
// jest.config.js
{
  collectCoverage: true,
  collectCoverageFrom: ["**/*.{ts,vue}"],
  coverageReporters: ["json-summary"],
}
```

To verify, run the tests, and it should generate: `./coverage/coverage-summary.json`

## Usage with GithubActions

To simplify the usage, we created a [CoverageGuard GithubAction](https://github.com/getyourguide/actions/tree/main/coverage-guard).\
[Example PR monorepo](https://github.com/getyourguide/server-driven-ui/pull/1207)

```yaml
- name: Coverage Guard
  uses: getyourguide/actions/coverage-guard@main
  env:
    CODEARTIFACT_AUTH_TOKEN: ${{ secrets.CODEARTIFACT_AUTH_TOKEN }}
    GITHUB_TOKEN: ${{ secrets.COVERAGE_GUARD_GITHUB_ACCESS_TOKEN }}
    DD_API_KEY: ${{ secrets.DATADOG_API_KEY }}
  with:
    options: "-cp ./apps/my-app/coverage/coverage-summary.json -mp apps/my-app"
```

## Usage with Drone

To simplify the usage, we created a [CoverageGuard Drone plugin](https://github.com/getyourguide/drone-plugins/tree/master/images/coverage-guard).

```yaml
coverage-guard:
  image: 130607246975.dkr.ecr.eu-central-1.amazonaws.com/drone-plugins/coverage-guard:latest
  secrets: [codeartifact_auth_token, github_token, dd_site, dd_api_key]
  # Pass any parameter valid for the npm package
  # Check options from above
  options: -cp ./coverage/coverage-summary.json -mp apps/my-app
  when:
    event: push
```

## Usage with the npm package

1.  Install dependency:

```sh
pnpm add @getyourguide/coverage-guard --save-dev
```

2.  Create a script in your `package.json` with the path to the coverage summary

```json
{
  "scripts": {
    "test:ci": "jest --coverage --coverageReporters=json-summary",
    "coverage": "coverage-guard -cp ./coverage/coverage-summary.json -mp apps/my-app"
  }
}
```

3.  Add a step to run the command in CI. This step should run after `test:ci`

```yml
coverage-guard:
  - pnpm coverage
```

Happy testing! ❤️
