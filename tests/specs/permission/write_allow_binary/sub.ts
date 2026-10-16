const binaryName = Oden.build.os === "windows" ? "binary.exe" : "binary";

Oden.writeTextFileSync(binaryName, "");
