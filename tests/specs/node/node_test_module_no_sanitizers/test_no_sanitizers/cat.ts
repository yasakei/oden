const filename = Oden.args[0];
using file = await Oden.open(filename);

await file.readable.pipeTo(Oden.stdout.writable);
