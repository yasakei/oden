// Verify the ignorelist for sanitizer-ignoring tests does NOT suppress genuine
// timer, resource and async op leaks introduced by a later, sanitized test.

Oden.test(
  { sanitizeOps: false, sanitizeResources: false },
  function ignoresSanitizersAndLeaksActivities() {
    const listener = Oden.listen({ hostname: "127.0.0.1", port: 0 });
    listener.accept().catch(() => {});
    const timer = setTimeout(() => {}, 100000);
    Oden.unrefTimer(timer);
  },
);

Oden.test(function laterTestLeaksItsOwnActivities() {
  const listener = Oden.listen({ hostname: "127.0.0.1", port: 0 });
  listener.accept().catch(() => {});
  const timer = setTimeout(() => {}, 100000);
  Oden.unrefTimer(timer);
});
