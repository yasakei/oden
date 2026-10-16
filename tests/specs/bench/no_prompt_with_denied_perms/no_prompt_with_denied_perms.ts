Oden.bench("no prompt", { permissions: { read: false } }, async () => {
  await Oden.readTextFile("./some_file.txt");
});
