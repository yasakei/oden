// This test is Linux/Darwin only
if (Oden.build.os !== "linux" && Oden.build.os !== "darwin") {
  console.log("hi\n\n0");
  Oden.exit(123);
}

const cmd = new Oden.Command("/usr/bin/env", {
  args: [
    "bash",
    "-c",
    [Oden.execPath(), "run", "--allow-read", "reader.ts", '<(echo "hi")'].join(
      " ",
    ),
  ],
}).spawn();

console.log((await cmd.status).code);
Oden.exit(123);
