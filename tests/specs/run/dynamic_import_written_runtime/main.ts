Oden.writeTextFileSync("./a.ts", "console.log(1);");
await import("./a.ts");
Oden.writeTextFileSync("./a.ts", "console.log(2);");
