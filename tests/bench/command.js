// Copyright 2018-2026 the Oden authors. MIT license.

Oden.bench("echo oden", async () => {
  await new Oden.Command("echo", { args: ["oden"] }).output();
});

Oden.bench("cat 128kb", async () => {
  await new Oden.Command("cat", {
    args: ["./tests/bench/testdata/128k.bin"],
  }).output();
});
