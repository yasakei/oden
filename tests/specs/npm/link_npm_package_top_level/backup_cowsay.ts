try {
  Oden.removeSync("./cowsay_backup", { recursive: true });
} catch {}
try {
  Oden.mkdirSync("./cowsay_backup");
} catch {}
Oden.copyFileSync("./cowsay/main.mjs", "./cowsay_backup/main.mjs");
Oden.copyFileSync("./cowsay/package.json", "./cowsay_backup/package.json");
