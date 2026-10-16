Oden.test("SourceCode.text", () => {
  const plugin: Oden.lint.Plugin = {
    name: "sample",
    rules: {
      "test": {
        create: (ctx) => {
          ctx.sourceCode.text;
          return {};
        },
      },
    },
  };
  Oden.lint.runPlugin(
    plugin,
    "./test.js",
    `function add(a, b) {
  return a + b;
}

add(1, 2);`,
  );
});
