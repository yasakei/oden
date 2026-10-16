const file = Oden.args[0];

const contents = Oden.readTextFileSync(file);

if (contents.includes("createRequire")) {
  console.log("true");
} else {
  console.log("false");
}
