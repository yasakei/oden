const content = Oden.readTextFileSync("./docs/index.html");

if (content.includes("..")) {
  throw new Error();
}
