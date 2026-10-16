const packageByOs = {
  "darwin": "@odentest/binary-package-mac",
  "linux": "@odentest/binary-package-linux",
  "win32": "@odentest/binary-package-windows",
}

const selectedPackage = packageByOs[process.platform];

if (!selectedPackage) {
  throw new Error("trying to run on unsupported platform");
}

require(selectedPackage);