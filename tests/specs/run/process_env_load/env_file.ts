import { loadEnvFile } from "node:process";
process.loadEnvFile("./env");
loadEnvFile("./env");
console.log(Oden.env.get("FOO"));
