#!/usr/bin/env -S oden run --allow-read

for (const item of Oden.readDirSync(".")) {
  console.log(item.name);
}
