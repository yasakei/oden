Oden.writeTextFileSync(
  "oden.json",
  JSON.stringify({
    imports: {
      "@odentest/pre-release-stable-latest":
        "npm:@odentest/pre-release-stable-latest@^1.0.0-beta.13",
    },
  }),
);
