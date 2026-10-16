Oden.mkdirSync("node_modules/.bin", { recursive: true });
Oden.mkdirSync("node_modules/pkg/bin", { recursive: true });
Oden.mkdirSync("node_modules/pkg/lib", { recursive: true });

Oden.writeTextFileSync("package.json", "{}\n");
Oden.writeTextFileSync(
  "node_modules/pkg/package.json",
  '{"name":"pkg","version":"1.0.0","type":"module"}\n',
);
Oden.writeTextFileSync(
  "node_modules/pkg/bin/cli.js",
  "import { x } from '../lib/x.js';\nconsole.log('loaded ok:', x);\n",
);
Oden.writeTextFileSync(
  "node_modules/pkg/lib/x.js",
  "export const x = 'OK';\n",
);
Oden.symlinkSync("../pkg/bin/cli.js", "node_modules/.bin/cli");
