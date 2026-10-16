// Regression test for https://github.com/denoland/deno/issues/18513
// Piping a file stream to a WritableStream releases the writer, which rejects
// the writer's ready/closed promises internally. Those rejections are handled,
// so they must not trip a debugger configured to "pause on uncaught
// exceptions".
const file = await Oden.makeTempFile();
const f = await Oden.open(file, { read: true, write: false });
await f.readable.pipeTo(new WritableStream());
await Oden.remove(file);
console.log("done");
