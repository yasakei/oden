await Oden.mkdir("dist", { recursive: true });
await Oden.writeTextFile("dist/index.html", "<h1>built</h1>");
