function echo(args: string[]) {
  const msg = args.join(", ");
  Oden.stdout.write(new TextEncoder().encode(msg));
}

echo(Oden.args);
