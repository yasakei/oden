const plugin = {
  name: "test-plugin",
  rules: {
    testRule: {
      create() {
        return {};
      },
    },
  },
};

Oden.lint.runPlugin(plugin, "source.ts", "export default {}");
