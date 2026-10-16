const name = Oden.args[0].trim();

function exists(path: string) {
  try {
    Oden.statSync(path);
    return true;
  } catch (error) {
    return false;
  }
}

if (
  !(exists(`node_modules/.bin/${name}`) ||
    exists(`node_modules/.bin/${name}.cmd`))
) {
  console.log("missing bin");
  console.log(`node_modules/.bin/${name}`);
  console.log(Oden.readDirSync("node_modules/.bin").toArray());
  Oden.exit(1);
}
