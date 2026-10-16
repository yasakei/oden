const arch = Oden.args[0];
const notArch = Oden.args[1];
const pkg = `@odentest+multiple-arches-win32-${arch}@1.0.0`;
try {
  Oden.statSync(`node_modules/.oden/${pkg}`);
  console.log(`${arch}: FOUND`);
} catch {
  console.log(`${arch}: NOT FOUND`);
}
if (notArch) {
  const notPkg = `@odentest+multiple-arches-win32-${notArch}@1.0.0`;
  try {
    Oden.statSync(`node_modules/.oden/${notPkg}`);
    console.log(`${notArch}: FOUND (unexpected)`);
  } catch {
    console.log(`${notArch}: NOT FOUND (expected)`);
  }
}
