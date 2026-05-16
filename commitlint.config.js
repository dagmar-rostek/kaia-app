/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "infra", "docs", "refactor", "test", "chore", "perf"],
    ],
    "subject-case": [0],
    "body-max-line-length": [0],
  },
};
