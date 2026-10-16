const isWindows = Oden.build.os === "windows";
for (const item of Oden.readDirSync("./node_modules/.bin")) {
  if (isWindows && item.name === "cli.cmd") {
    console.log("yes");
  } else if (!isWindows && item.name === "cli") {
    console.log("yes");
  }
}
