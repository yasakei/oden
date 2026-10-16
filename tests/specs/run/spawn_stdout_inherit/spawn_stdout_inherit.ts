await new Oden.Command(Oden.execPath(), {
  args: ["eval", "--quiet", "console.log('Hello, world! 1')"],
  stdout: "inherit",
}).output();
new Oden.Command(Oden.execPath(), {
  args: ["eval", "--quiet", "console.log('Hello, world! 2')"],
  stdout: "inherit",
}).outputSync();
