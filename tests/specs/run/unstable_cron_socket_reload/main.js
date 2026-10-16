console.error("[ISOLATE] Starting");

// Register a cron job
console.error("[ISOLATE] Registering test-cron");
Oden.cron("test-cron", "* * * * *", () => {
  console.error("[ISOLATE] test-cron executed");
});
console.error("[ISOLATE] test-cron registered successfully");

// Keep alive with Oden.serve
Oden.serve({ port: 0 }, () => new Response("Hello"));
