import chalk from "npm:chalk@5";

const stat = Oden.statSync(new URL("node_modules", import.meta.url));
console.log(chalk.green(stat.isDirectory));
