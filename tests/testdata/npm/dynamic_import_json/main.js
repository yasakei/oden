const info = await import("npm:@odentest/binary-package@1/package.json", {
  assert: { type: "json" },
});
console.log(json);
