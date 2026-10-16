// https://github.com/denoland/deno/pull/16970
Oden.test("handle thrown error in async function", async () => {
  const dirPath = Oden.makeTempDirSync();
  const filePath = `${dirPath}/file.txt`;
  try {
    await Oden.stat(filePath);
  } catch {
    await Oden.writeTextFile(filePath, "");
  } finally {
    await Oden.remove(filePath);
    await Oden.remove(dirPath);
  }
});
