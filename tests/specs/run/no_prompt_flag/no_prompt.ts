new Worker("data:,setTimeout(() => Oden.exit(2), 200)", { type: "module" });

try {
  await new Oden.Command("ps", {
    stdout: "inherit",
    stderr: "inherit",
  }).output();
} catch {
  Oden.exit(0);
}
