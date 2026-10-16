const [, errorInfo] = Oden[Oden.internal].core.evalContext(
  'throw new DOMException("foo")',
  new URL("..", import.meta.url).href,
);
console.log(errorInfo);
