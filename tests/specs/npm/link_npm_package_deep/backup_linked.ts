try {
  Oden.removeSync("./linked_backup", { recursive: true });
} catch {}
try {
  Oden.mkdirSync("./linked_backup");
} catch {}
Oden.copyFileSync("./linked/main.mjs", "./linked_backup/main.mjs");
Oden.copyFileSync("./linked/package.json", "./linked_backup/package.json");
