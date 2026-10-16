new Worker(import.meta.resolve("./worker.ts"), {
  type: "module",
  oden: {
    permissions: {
      import: [],
    },
  },
});
