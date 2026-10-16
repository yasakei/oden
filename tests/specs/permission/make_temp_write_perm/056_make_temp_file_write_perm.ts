Oden.mkdirSync("subdir");

// async file
{
  const path = await Oden.makeTempFile({ dir: `subdir` });
  try {
    if (!path.match(/^subdir[/\\][^/\\]+/)) {
      throw Error("bad " + path);
    }
    console.log("good", path);
  } finally {
    await Oden.remove(path);
  }
}
// sync file
{
  const path = Oden.makeTempFileSync({ dir: `subdir` });
  try {
    if (!path.match(/^subdir[/\\][^/\\]+/)) {
      throw Error("bad " + path);
    }
    console.log("good", path);
  } finally {
    await Oden.remove(path);
  }
}

// async dir
{
  const path = await Oden.makeTempDir({ dir: `subdir` });
  try {
    if (!path.match(/^subdir[/\\][^/\\]+/)) {
      throw Error("bad " + path);
    }
    console.log("good", path);
  } finally {
    await Oden.remove(path);
  }
}

// sync dir
{
  const path = Oden.makeTempDirSync({ dir: `subdir` });
  try {
    if (!path.match(/^subdir[/\\][^/\\]+/)) {
      throw Error("bad " + path);
    }
    console.log("good", path);
  } finally {
    await Oden.remove(path);
  }
}
