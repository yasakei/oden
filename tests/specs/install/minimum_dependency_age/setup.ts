if (!Oden.args.some((a) => a.includes("minimum-dependency-age"))) {
  Oden.writeTextFileSync(
    "oden.json",
    JSON.stringify({
      "minimumDependencyAge": "2025-05-01T20:00:00.000Z",
    }),
  );
}
