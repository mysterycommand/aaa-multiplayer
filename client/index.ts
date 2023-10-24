import { Evt } from "evt";
import { negotiate } from "../shared/negotiate.js";
import { rtcConfiguration } from "../shared/rtcConfiguration.js";

const createWebSocket = (...args: ConstructorParameters<typeof WebSocket>) =>
  new WebSocket(...args);
const createPeerConnection = () => new RTCPeerConnection(rtcConfiguration);

const { hostname, protocol } = location;
const ws = createWebSocket(
  `${protocol.replace("http", "ws")}//${hostname}:8080`,
);
const pc = createPeerConnection();

Evt.from<Event>(ws, "open").attachOnce(() => {
  negotiate(ws, pc, { RTCSessionDescription });

  pc.createDataChannel("test");
});
