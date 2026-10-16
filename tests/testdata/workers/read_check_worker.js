onmessage = async () => {
  const { state } = await Oden.permissions.query({
    name: "read",
  });
  postMessage(state === "granted");
  close();
};
