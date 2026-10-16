const binaryName = Oden.build.os === "windows" ? "binary.exe" : "binary";
const pathSep = Oden.build.os === "windows" ? "\\" : "/";

Oden.mkdirSync("subdir");
Oden.copyFileSync(binaryName, "subdir/" + binaryName);

try {
  const commandResult = new Oden.Command(
    "binary",
    {
      env: { "PATH": Oden.cwd() + pathSep + "subdir" },
      stdout: "inherit",
      stderr: "inherit",
    },
  ).outputSync();

  console.log(commandResult.code);
} catch (err) {
  console.log(err);
}

try {
  const child = Oden.run(
    {
      cmd: ["binary"],
      env: { "PATH": Oden.cwd() + pathSep + "subdir" },
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  console.log((await child.status()).code);
} catch (err) {
  console.log(err);
}
