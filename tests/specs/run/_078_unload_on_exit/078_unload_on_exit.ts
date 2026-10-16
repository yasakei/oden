globalThis.onunload = () => {
  console.log("onunload is called");
  // This second exit call doesn't trigger unload event,
  // and therefore actually stops the process.
  Oden.exit(1);
  console.log("This doesn't show up in console");
};
// This exit call triggers the above unload event handler.
Oden.exit(0);
