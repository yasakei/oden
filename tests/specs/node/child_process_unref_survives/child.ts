// Wait briefly then write a marker file to prove we survived the parent's exit.
await new Promise((resolve) => setTimeout(resolve, 500));
Oden.writeTextFileSync(Oden.args[0], "child was here");
