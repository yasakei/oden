import { loadConfigFile } from "npm:@odentest/permissions-outside-package";

const fileName = `${Oden.cwd()}/foo/config.js`;
const config = loadConfigFile(fileName);
console.log(config);
