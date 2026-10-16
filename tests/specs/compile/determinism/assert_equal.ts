const file1 = Oden.readFileSync(Oden.args[0]);
const file2 = Oden.readFileSync(Oden.args[1]);

if (file1.length !== file2.length) {
  console.error("File lengths are different");
  Oden.exit(1);
}
for (let i = 0; i < file1.length; i++) {
  if (file1[i] !== file2[i]) {
    console.error("Files are different");
    Oden.exit(1);
  }
}

console.error("Same");
