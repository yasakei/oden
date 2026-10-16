new Worker(
  "http://localhost:4545/workers/dynamic_remote.ts",
  {
    type: "module",
    oden: {
      permissions: {
        // dynamic_remote.ts will import from example.com
        import: false,
      },
    },
  },
);
