/// <reference no-default-lib="true" />
/// <reference lib="oden.ns" />

// unstable apis removed here, so should error
Oden.listenDatagram({
  port: 3000,
  transport: "udp",
});
