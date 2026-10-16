// Copyright 2018-2026 the Oden authors. MIT license.

import {
  assert,
  assertEquals,
  assertFalse,
  assertMatch,
  assertRejects,
  assertStringIncludes,
  unindent,
} from "./test_util.ts";

import { basename, join, toFileUrl } from "@std/path";

class TempDir implements AsyncDisposable, Disposable {
  #path: string;
  constructor(options?: Oden.MakeTempOptions) {
    // Resolve symlinks (e.g. macOS `/var` -> `/private/var`) up front. The
    // bundler canonicalizes module paths, and Oden matches read/write grants
    // by literal path, so tests that scope permissions to this directory must
    // grant the canonical path the bundler will actually check against.
    this.#path = Oden.realPathSync(Oden.makeTempDirSync(options));
  }

  async [Symbol.asyncDispose]() {
    await Oden.remove(this.#path, { recursive: true });
  }

  [Symbol.dispose]() {
    Oden.removeSync(this.#path, { recursive: true });
  }

  get path() {
    return this.#path;
  }

  join(path: string) {
    return join(this.#path, path);
  }
}

class TempFile implements AsyncDisposable, Disposable {
  #path: string;
  constructor(options?: Oden.MakeTempOptions) {
    this.#path = Oden.makeTempFileSync(options);
  }

  async [Symbol.asyncDispose]() {
    await Oden.remove(this.#path);
  }

  [Symbol.dispose]() {
    Oden.removeSync(this.#path);
  }

  get path() {
    return this.#path;
  }
}

async function assertPathNotFound(path: string) {
  await assertRejects(() => Oden.lstat(path), Oden.errors.NotFound);
}

Oden.test("bundle: basic in-memory bundle succeeds and returns content", async () => {
  using dir = new TempDir();
  const entry = dir.join("index.ts");
  const dep = dir.join("mod.ts");

  await Oden.writeTextFile(
    dep,
    [
      "export function greet(name: string) {",
      "  return `hello ${name}`;",
      "}",
    ].join("\n"),
  );
  await Oden.writeTextFile(
    entry,
    [
      "import { greet } from './mod.ts';",
      "console.log(greet('world'));",
    ].join("\n"),
  );

  const result = await Oden.bundle({
    entrypoints: [entry],
    // keep readable to assert on content
    minify: false,
    write: false,
  });

  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  assert(Array.isArray(result.warnings));
  assert(result.outputFiles !== undefined);
  const withContent = result.outputFiles!.filter((f) => !!f.contents);
  assert(withContent.length >= 1);
  const content = withContent[0].text();
  // should contain the string literal from the source
  assertStringIncludes(content, "hello ");
  // stripped of TS types
  assertFalse(content.includes(": string"));
});

Oden.test("bundle: write to outputDir omits outputFiles and writes files", async () => {
  using dir = new TempDir();
  const srcDir = dir.join("src");
  const outDir = dir.join("dist");
  await Oden.mkdir(srcDir, { recursive: true });
  const entry = join(srcDir, "main.ts");
  const dep = join(srcDir, "util.ts");

  await Oden.writeTextFile(
    dep,
    unindent`
      export const msg: string = 'Hello bundle write';
      export function upper(s: string) { return s.toUpperCase(); }
    `,
  );
  await Oden.writeTextFile(
    entry,
    unindent`
      import { msg, upper } from './util.ts';
      console.log(upper(msg));
    `,
  );

  const result = await Oden.bundle({
    entrypoints: [entry],
    outputDir: outDir,
    // default write is true when outputDir/outputPath is set
    // but be explicit here
    write: true,
    minify: false,
  });

  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  // when writing, the provider returns `null` for outputFiles currently
  assert(result.outputFiles == null);

  // verify a JS file was written to the output directory
  const files = [] as string[];
  for await (const e of Oden.readDir(outDir)) {
    if (e.isFile && e.name.endsWith(".js")) files.push(e.name);
  }
  assert(files.length >= 1);
  // read first file and check expected content present
  const outJsPath = join(outDir, files[0]);
  const outContent = await Oden.readTextFile(outJsPath);
  assertStringIncludes(outContent, "Hello bundle write");
});

Oden.test("bundle: write requires caller permission", async () => {
  using dir = new TempDir();
  const entry = dir.join("main.ts");
  const runner = dir.join("runner.ts");
  const blockedDir = dir.join("blocked");
  const output = join(blockedDir, "dist", "main.js");

  await Oden.writeTextFile(entry, "export const value = 42;\n");
  await Oden.writeTextFile(
    runner,
    unindent`
      await Oden.bundle({
        entrypoints: [${JSON.stringify(entry)}],
        outputPath: ${JSON.stringify(output)},
        write: true,
      });
    `,
  );

  const { success, stderr } = await new Oden.Command(Oden.execPath(), {
    args: [
      "run",
      "--no-config",
      "--no-lock",
      "--no-prompt",
      "--quiet",
      "--unstable-bundle",
      `--allow-read=${dir.path}`,
      runner,
    ],
    stderr: "piped",
  }).output();

  assertFalse(success);
  const stderrText = new TextDecoder().decode(stderr);
  assertStringIncludes(stderrText, "Requires write access");
  assertStringIncludes(stderrText, "--allow-write");
  await assertPathNotFound(blockedDir);
  await assertPathNotFound(output);
});

Oden.test("bundle: module read requires caller permission", async () => {
  using dir = new TempDir();
  const secret = dir.join("secret.ts");
  const runner = dir.join("runner.ts");

  await Oden.writeTextFile(
    secret,
    'export const TOKEN = "super-secret-value";\n',
  );
  await Oden.writeTextFile(
    runner,
    unindent`
      const result = await Oden.bundle({
        entrypoints: [${JSON.stringify(secret)}],
        write: false,
      });
      console.log(JSON.stringify({
        success: result.success,
        outputs: result.outputFiles?.length ?? 0,
        errors: result.errors.map((error) => error.text),
      }));
    `,
  );

  // Read access to the runner only, so reading the bundled module is denied
  // before graph preparation reads its source.
  const { success, stdout } = await new Oden.Command(Oden.execPath(), {
    args: [
      "run",
      "--no-config",
      "--no-lock",
      "--no-prompt",
      "--quiet",
      "--unstable-bundle",
      `--allow-read=${runner}`,
      runner,
    ],
    stdout: "piped",
  }).output();

  assert(success);
  const result = JSON.parse(new TextDecoder().decode(stdout)) as {
    success: boolean;
    outputs: number;
    errors: string[];
  };
  assertFalse(result.success);
  assertEquals(result.outputs, 0);
  assert(
    result.errors.some((error) => error.includes("Requires read access")),
  );
  assert(
    result.errors.some((error) => error.includes("--allow-read")),
    JSON.stringify(result.errors),
  );
  assertFalse(
    result.errors.some((error) => error.includes("import()")),
    JSON.stringify(result.errors),
  );
});

Oden.test("bundle: permitted path alias preserves module identity", async () => {
  using dir = new TempDir();
  const realDir = dir.join("real");
  const aliasDir = dir.join("alias");
  const entry = join(realDir, "entry.ts");
  const aliasEntry = join(aliasDir, "entry.ts");
  const runner = dir.join("runner.ts");

  await Oden.mkdir(realDir);
  await Oden.writeTextFile(entry, "export const value = 42;\n");
  await Oden.symlink(realDir, aliasDir, {
    type: Oden.build.os === "windows" ? "junction" : "dir",
  });
  await Oden.writeTextFile(
    runner,
    unindent`
      const result = await Oden.bundle({
        entrypoints: [${JSON.stringify(aliasEntry)}],
        write: false,
      });
      console.log(JSON.stringify({
        success: result.success,
        errors: result.errors.map((error) => error.text),
      }));
    `,
  );

  const { success, stdout, stderr } = await new Oden.Command(
    Oden.execPath(),
    {
      args: [
        "run",
        "--no-config",
        "--no-lock",
        "--no-prompt",
        "--quiet",
        "--unstable-bundle",
        `--allow-read=${runner},${aliasEntry}`,
        runner,
      ],
      stdout: "piped",
      stderr: "piped",
    },
  ).output();

  const stderrText = new TextDecoder().decode(stderr);
  assert(success, stderrText);
  const result = JSON.parse(new TextDecoder().decode(stdout)) as {
    success: boolean;
    errors: string[];
  };
  assert(result.success, JSON.stringify(result.errors));
});

Oden.test("bundle: html entrypoint read requires caller permission", async () => {
  using dir = new TempDir();
  const secretDir = dir.join("secret");
  const secretHtml = join(secretDir, "index.html");
  const outDir = dir.join("dist");
  const runner = dir.join("runner.ts");

  await Oden.mkdir(secretDir, { recursive: true });
  await Oden.writeTextFile(
    secretHtml,
    unindent`
      <html>
        <body><script type="module" src="./main.ts"></script></body>
      </html>
    `,
  );
  await Oden.writeTextFile(
    join(secretDir, "main.ts"),
    "console.log('secret');\n",
  );
  await Oden.writeTextFile(
    runner,
    unindent`
      await Oden.bundle({
        entrypoints: [${JSON.stringify(toFileUrl(secretHtml).href)}],
        outputDir: ${JSON.stringify(outDir)},
        write: false,
      });
    `,
  );

  // Read access to the runner only, so loading the HTML entrypoint is denied.
  const { success, stderr } = await new Oden.Command(Oden.execPath(), {
    args: [
      "run",
      "--no-config",
      "--no-lock",
      "--no-prompt",
      "--quiet",
      "--unstable-bundle",
      `--allow-read=${runner}`,
      runner,
    ],
    stderr: "piped",
  }).output();

  assertFalse(success);
  const stderrText = new TextDecoder().decode(stderr);
  assertStringIncludes(stderrText, "Requires read access");
  assertStringIncludes(stderrText, "--allow-read");
  await assertPathNotFound(outDir);
});

Oden.test("bundle: worker permissions override parent permissions", async () => {
  using dir = new TempDir();
  const sourceDir = dir.join("source");
  const secretDir = dir.join("secret");
  const blockedDir = dir.join("blocked");
  const entry = join(sourceDir, "main.ts");
  const secretHtml = join(secretDir, "secret.html");
  const output = join(blockedDir, "main.js");
  const runner = dir.join("worker_runner.ts");

  await Oden.mkdir(sourceDir, { recursive: true });
  await Oden.mkdir(secretDir, { recursive: true });
  await Oden.writeTextFile(entry, "export const value = 42;\n");
  await Oden.writeTextFile(secretHtml, "<p>blocked</p>\n");

  await Oden.writeTextFile(
    runner,
    unindent`
      const workerSource = ${
      JSON.stringify(unindent`
        self.onmessage = async ({ data }) => {
          const result = {};

          try {
            await Oden.bundle({
              entrypoints: [data.secretHtml],
              outputDir: data.outputDir,
              write: false,
            });
            result.htmlRead = "allowed";
          } catch (err) {
            result.htmlRead = String(err);
          }

          try {
            await Oden.bundle({
              entrypoints: [data.entry],
              outputPath: data.output,
              write: true,
            });
            result.write = "allowed";
          } catch (err) {
            result.write = String(err);
          }

          self.postMessage(result);
        };
      `)
    };
      const workerUrl = URL.createObjectURL(
        new Blob([workerSource], { type: "text/javascript" }),
      );
      const worker = new Worker(workerUrl, {
        type: "module",
        oden: {
          permissions: {
            read: [${JSON.stringify(sourceDir)}],
            write: false,
          },
        },
      });
      const result = await new Promise((resolve, reject) => {
        worker.onmessage = (event) => resolve(event.data);
        worker.onerror = (event) => reject(event.error ?? event.message);
        worker.postMessage({
          entry: ${JSON.stringify(entry)},
          secretHtml: ${JSON.stringify(toFileUrl(secretHtml).href)},
          outputDir: ${JSON.stringify(blockedDir)},
          output: ${JSON.stringify(output)},
        });
      });
      worker.terminate();
      console.log(JSON.stringify(result));
    `,
  );

  const { success, stdout, stderr } = await new Oden.Command(
    Oden.execPath(),
    {
      args: [
        "run",
        "--no-config",
        "--no-lock",
        "--no-prompt",
        "--quiet",
        "--unstable-bundle",
        "--unstable-worker-options",
        `--allow-read=${dir.path}`,
        `--allow-write=${dir.path}`,
        runner,
      ],
      stdout: "piped",
      stderr: "piped",
    },
  ).output();

  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);
  assert(success, stderrText);
  const result = JSON.parse(stdoutText) as {
    htmlRead: string;
    write: string;
  };
  assertStringIncludes(result.htmlRead, "Requires read access");
  assertStringIncludes(result.write, "Requires write access");
  await assertPathNotFound(blockedDir);
  await assertPathNotFound(output);
});

Oden.test("bundle: minify produces smaller output", async () => {
  using dir = new TempDir();
  const entry = dir.join("index.ts");
  const dep = dir.join("calc.ts");

  await Oden.writeTextFile(
    dep,
    unindent`
      export function add(a: number, b: number) {
        /* lots of spacing and comments to be minified */
        const sum = a + b;  // trailing comment
        return sum;
      }
    `,
  );
  await Oden.writeTextFile(
    entry,
    unindent`
      import { add } from './calc.ts';
      console.log(add(  1,   2));
    `,
  );

  const normal = await Oden.bundle({
    entrypoints: [entry],
    minify: false,
    write: false,
  });
  assertEquals(normal.success, true);
  const normalJs = normal.outputFiles!.find((f) => !!f.contents)!;

  const minified = await Oden.bundle({
    entrypoints: [entry],
    minify: true,
    write: false,
  });
  assertEquals(minified.success, true);
  const minJs = minified.outputFiles!.find((f) => !!f.contents)!;

  assert(minJs.text().length < normalJs.text().length);
});

Oden.test("bundle: keep-names preserves names", async () => {
  using dir = new TempDir();
  const entry = dir.join("index.ts");

  await Oden.writeTextFile(
    entry,
    unindent`
      export function add(a: number, b: number) {
        /* lots of spacing and comments to be minified */
        const sum = a + b;  // trailing comment
        return sum;
      }
    `,
  );

  const minifiedWithNames = await Oden.bundle({
    entrypoints: [entry],
    minify: true,
    keepNames: true,
    write: false,
  });
  assertEquals(minifiedWithNames.success, true);
  const minJs = minifiedWithNames.outputFiles!.find((f) => !!f.contents)!;

  assertMatch(minJs.text(), /export\s*\{[^}]*\badd\b[^}]*\}/);
});

Oden.test("bundle: code splitting with multiple entrypoints", async () => {
  using dir = new TempDir();
  const shared = dir.join("shared.ts");
  const a = dir.join("a.ts");
  const b = dir.join("b.ts");

  await Oden.writeTextFile(
    shared,
    unindent`
    export const shared = 'shared chunk';
  `,
  );
  await Oden.writeTextFile(
    a,
    unindent`
      import { shared } from './shared.ts';
      console.log('a', shared);
    `,
  );
  await Oden.writeTextFile(
    b,
    unindent`
      import { shared } from './shared.ts';
      console.log('b', shared);
    `,
  );

  const outDir = dir.join("dist");
  const result = await Oden.bundle({
    entrypoints: [a, b],
    codeSplitting: true,
    // esbuild requires an output directory when splitting
    outputDir: outDir,
    write: false,
    minify: false,
  });

  assertEquals(result.success, true);
  assert(result.outputFiles !== undefined);
  const jsFiles = result.outputFiles!.filter((f) => !!f.contents);
  // 2 entries + at least 1 shared chunk
  assert(jsFiles.length >= 3);
});

Oden.test("bundle: inline sourcemap is present", async () => {
  using dir = new TempDir();
  const entry = dir.join("index.ts");
  await Oden.writeTextFile(entry, "export const x = 1;\n");

  const result = await Oden.bundle({
    entrypoints: [entry],
    sourcemap: "inline",
    write: false,
    minify: false,
  });

  assertEquals(result.success, true);
  const js = result.outputFiles!.find((f) => !!f.contents)!;
  assertStringIncludes(
    js.text(),
    "sourceMappingURL=data:application/json;base64",
  );
});

Oden.test("bundle: missing entrypoint rejects", async () => {
  using dir = new TempDir();
  const missing = dir.join("does_not_exist.ts");

  let threw = false;
  try {
    await Oden.bundle({
      entrypoints: [missing],
      write: false,
    });
  } catch (_e) {
    threw = true;
  }
  assert(threw);
});

Oden.test("bundle: returns errors for unresolved import", async () => {
  using dir = new TempDir();
  const entry = dir.join("main.ts");
  // entry exists, but imports a non-existent module
  await Oden.writeTextFile(
    entry,
    unindent`
      import './missing.ts';
      export const value = 42;
    `,
  );

  const result = await Oden.bundle({
    entrypoints: [entry],
    write: false,
    minify: false,
  });

  assertEquals(result.success, false);
  assert(result.errors.length > 0);
  // should reference the missing import path in one of the error messages
  const texts = result.errors.map((e) => e.text).join("\n");
  assertStringIncludes(texts, "missing.ts");
});

// deno-lint-ignore no-explicit-any
async function evalEsmString(code: string): Promise<any> {
  await using file = new TempFile({ suffix: ".js" });
  Oden.writeTextFileSync(file.path, code);
  return await import(toFileUrl(file.path).toString());
}

Oden.test("bundle: replaces require shim when platform is oden", async () => {
  using dir = new TempDir();
  const entry = dir.join("index.cjs");
  const input = unindent`
    const sep = require("node:path").sep;
    module.exports = ["good", sep.length];
  `;
  await Oden.writeTextFile(entry, input);

  const result = await Oden.bundle({
    entrypoints: [entry],
    platform: "oden",
    write: false,
  });

  assertEquals(result.success, true);
  const js = result.outputFiles!.find((f) => !!f.contents)!;

  const output = await evalEsmString(js.text());
  assertEquals(output.default, ["good", 1]);
});

Oden.test("bundle: html works", async () => {
  using dir = new TempDir();
  const entry = dir.join("index.html");
  const input = unindent`
    <html>
      <body>
        <script src="./index.ts"></script>
      </body>
    </html>
  `;
  const script = dir.join("index.ts");
  const scriptInput = unindent`
    console.log("hello");
    document.body.innerHTML = "hello";
  `;
  const outDir = dir.join("dist");

  await Oden.writeTextFile(entry, input);
  await Oden.writeTextFile(script, scriptInput);

  const result = await Oden.bundle({
    entrypoints: [entry],
    outputDir: outDir,
    write: false,
  });

  const js = result.outputFiles!.find((f) =>
    !!f.contents && f.path.endsWith(".js")
  );
  if (!js) {
    throw new Error("No JS file found");
  }

  const html = result.outputFiles!.find((f) =>
    !!f.contents && f.path.endsWith(".html")
  )!;
  if (!html) {
    throw new Error("No HTML file found");
  }

  assert(result.success);
  assertEquals(result.errors.length, 0);
  assertEquals(result.outputFiles!.length, 2);

  const jsFileName = basename(js.path);

  assertStringIncludes(html.text(), `src="./${jsFileName}`);

  assertStringIncludes(js.text(), "innerHTML");
  assertStringIncludes(js.text(), "hello");
});
