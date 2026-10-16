try {
  new Oden.Command("oden", {
    args: ["--version"],
  }).outputSync();
} catch (err) {
  console.error(err);
}

try {
  new Oden.Command(Oden.execPath(), {
    args: ["--version"],
  }).outputSync();
} catch (err) {
  console.error(err);
}
