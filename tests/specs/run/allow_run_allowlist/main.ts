try {
  await new Oden.Command("ls").output();
} catch (e) {
  console.log(e);
}

const { success } = await new Oden.Command("curl", {
  args: ["--help"],
  stdout: "null",
  stderr: "inherit",
}).output();
console.log(success);
