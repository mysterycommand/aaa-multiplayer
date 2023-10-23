import { createServer as createHttpServer } from "node:http";
import { WebSocketServer, type ServerOptions, WebSocket } from "ws";
import * as WebRTC from "node-datachannel/polyfill";
import { rtcConfiguration } from "../shared/rtcConfiguration.js";
import { Evt } from "evt";
import { negotiate } from "../shared/negotiate.js";

const {
  // @ts-expect-error - something funky about these types
  default: { RTCPeerConnection, RTCSessionDescription },
} = WebRTC;

const createWsServer = (options: ServerOptions) => new WebSocketServer(options);
const createPeerConnection = () => new RTCPeerConnection(rtcConfiguration);

const httpServer = createHttpServer();
const wsServer = createWsServer({ server: httpServer });

Evt.from<WebSocket>(wsServer, "connection").attach(async (ws) => {
  if (ws.readyState !== WebSocket.OPEN) {
    await new Promise((resolve) =>
      Evt.from<Event>(ws, "open").attachOnce(resolve)
    );
  }

  const pc = createPeerConnection();
  negotiate(ws, pc, { RTCSessionDescription });

  Evt.from<RTCDataChannelEvent>(pc, "datachannel").attach(
    ({ type, channel }) => {
      console.log(type, channel.label, channel.readyState);
    }
  );
});

httpServer.listen(8080, () => console.log("Server listening on 8080"));
