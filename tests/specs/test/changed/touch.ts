Oden.writeTextFileSync(
  "math.ts",
  Oden.readTextFileSync("math.ts") + "\n// changed\n",
);
