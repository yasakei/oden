Oden.writeTextFileSync("./b.ts", "console.log(1);");
await import("./a.ts");
Oden.writeTextFileSync("./b.ts", "console.log(2);");
