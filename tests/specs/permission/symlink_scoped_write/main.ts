await Oden.writeTextFile("target.txt", "x");
try {
  await Oden.symlink("target.txt", "link.txt");
  console.log("ok");
} catch (e) {
  console.log(`${(e as Error).constructor.name}: ${(e as Error).message}`);
}
