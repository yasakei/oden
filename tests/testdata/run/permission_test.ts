// Copyright 2018-2019 the Oden authors. All rights reserved. MIT license.
const name = Oden.args[0];
// deno-lint-ignore no-explicit-any
const test: { [key: string]: (...args: any[]) => void | Promise<void> } = {
  readRequired() {
    Oden.readFileSync("assets/hello.txt");
    return Promise.resolve();
  },
  writeRequired() {
    Oden.makeTempDirSync();
  },
  envRequired() {
    Oden.env.get("home");
  },
  netRequired() {
    Oden.listen({ transport: "tcp", port: 4541 });
  },
  async runRequired() {
    await new Oden.Command(Oden.build.os === "windows" ? "cmd.exe" : "printf", {
      args: Oden.build.os === "windows" ? ["/c", "echo hello"] : ["hello"],
    }).output();
  },
};

if (!test[name]) {
  console.log("Unknown test:", name);
  Oden.exit(1);
}

test[name]();
