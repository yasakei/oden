// Testing the following:
// | `oden run --allow-run=binary`         | `which path == "/usr/bin/binary"` at startup | `which path != "/usr/bin/binary"` at startup |
// |---------------------------------------|----------------------------------------------|--------------------------------------------|
// | **`Oden.Command("binary")`**          | :white_check_mark:                                          | :white_check_mark:                                         |
// | **`Oden.Command("/usr/bin/binary")`** | :white_check_mark:                                          | :x:                                         |
// | `oden run --allow-run=/usr/bin/binary | `which path == "/usr/bin/binary"` at runtime | `which path != "/usr/bin/binary"` at runtime |
// |---------------------------------------|----------------------------------------------|--------------------------------------------|
// | **`Oden.Command("binary")`**          | :white_check_mark:                                          | :x:                                         |
// | **`Oden.Command("/usr/bin/binary")`** | :white_check_mark:                                          | :white_check_mark:                                         |

const binaryName = Oden.build.os === "windows" ? "binary.exe" : "binary";
const pathSep = Oden.build.os === "windows" ? "\\" : "/";
const cwd = Oden.cwd();
const execPathParent = `${Oden.cwd()}${pathSep}sub`;
const execPath = `${execPathParent}${pathSep}${binaryName}`;

Oden.mkdirSync(execPathParent);
Oden.copyFileSync(Oden.execPath(), execPath);

const testUrl = `data:application/typescript;base64,${
  btoa(`
  console.error(await Oden.permissions.query({ name: "run", command: "binary" }));
  console.error(await Oden.permissions.query({ name: "run", command: "${
    execPath.replaceAll("\\", "\\\\")
  }" }));
  Oden.env.set("PATH", "");
  console.error(await Oden.permissions.query({ name: "run", command: "binary" }));
  console.error(await Oden.permissions.query({ name: "run", command: "${
    execPath.replaceAll("\\", "\\\\")
  }" }));
`)
}`;

await new Oden.Command(Oden.execPath(), {
  args: [
    "run",
    "--allow-env",
    "--allow-run=binary",
    testUrl,
  ],
  stdout: "inherit",
  stderr: "inherit",
  env: { "PATH": execPathParent },
}).output();

console.error("---");

await new Oden.Command(Oden.execPath(), {
  args: [
    "run",
    "--allow-env",
    "--allow-run=binary",
    testUrl,
  ],
  stderr: "inherit",
  stdout: "inherit",
  env: { "PATH": "" },
}).output();

console.error("---");

await new Oden.Command(Oden.execPath(), {
  args: [
    "run",
    "--allow-env",
    `--allow-run=${execPath}`,
    testUrl,
  ],
  stderr: "inherit",
  stdout: "inherit",
  env: { "PATH": execPathParent },
}).output();
