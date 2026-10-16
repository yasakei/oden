const output = new Oden.Command(Oden.execPath(), {
  args: ["publish"],
  clearEnv: true,
  env: {
    "GITHUB_ACTIONS": "true",
  },
  stdout: "inherit",
  stderr: "inherit",
}).outputSync();
Oden.exit(output.code);
