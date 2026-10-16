import WebSocket from "npm:ws@8.18.0";

const key = Oden.readTextFileSync("../../../testdata/tls/localhost.key");
const cert = Oden.readTextFileSync("../../../testdata/tls/localhost.crt");

Oden.serve({ key, cert, port: 0, onListen }, (req) => {
  const { socket, response } = Oden.upgradeWebSocket(req);
  socket.addEventListener("open", () => {
    console.log("open on server");
  });
  socket.addEventListener("message", () => {
    console.log("message on server");
    Oden.exit(0);
  });
  return response;
});

function onListen({ port }) {
  const socket = new WebSocket(`wss://localhost:${port}`);
  socket.on("open", () => {
    console.log("open on client");
    socket.send("hi");
  });
}
