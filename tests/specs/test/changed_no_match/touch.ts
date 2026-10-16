Oden.writeTextFileSync(
  "unrelated.ts",
  Oden.readTextFileSync("unrelated.ts") + "\n// changed\n",
);
