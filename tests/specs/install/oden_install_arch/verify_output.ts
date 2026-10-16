const metadata = Oden.statSync(
  "node_modules/.oden/@odentest+multiple-arches-win32-arm64@1.0.0",
);
if (metadata) {
  console.log("FOUND");
}
