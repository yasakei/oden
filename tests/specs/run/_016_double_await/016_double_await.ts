// This is to test if Oden would die at 2nd await
// See https://github.com/denoland/deno/issues/919
(async () => {
  const currDirInfo = await Oden.stat(".");
  const parentDirInfo = await Oden.stat("..");
  console.log(currDirInfo.isDirectory);
  console.log(parentDirInfo.isFile);
})();
