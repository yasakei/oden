const path = Oden.args[0];
const contents = Oden.readTextFileSync(path);

const odenDir = Oden.env.getEnv("ODEN_DIR");
const cwd = Oden.cwd();

const newContents = contents.replace(cwd, "$CWD").replace(odenDir, "$ODEN_DIR");
Oden.writeTextFileSync(path, newContents);
