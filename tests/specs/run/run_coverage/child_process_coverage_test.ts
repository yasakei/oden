Oden.test("foo 1 0", () => runOdenCommand("run foo.ts 1 0"));
Oden.test("foo 0 1", () => runOdenCommand("run foo.ts 0 1"));

async function runOdenCommand(args: string) {
  await new Oden.Command(Oden.execPath(), { args: args.split(" ") }).output();
}
