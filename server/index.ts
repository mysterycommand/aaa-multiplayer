import { createServer as createHttpServer } from "node:http";
import { WebSocketServer, type ServerOptions, WebSocket } from "ws";
import * as WebRTC from "node-datachannel/polyfill";
import { rtcConfiguration } from "../shared/rtcConfiguration.js";
import { Evt } from "evt";
import { negotiate } from "../shared/negotiate.js";

const {
  // @ts-expect-error - something funky about these types and/or my build setup
  default: { RTCPeerConnection, RTCSessionDescription },
} = WebRTC;

const createWsServer = (options: ServerOptions) => new WebSocketServer(options);
const createPeerConnection = () => new RTCPeerConnection(rtcConfiguration);

const httpServer = createHttpServer();
const wsServer = createWsServer({ server: httpServer });

Evt.from<WebSocket>(wsServer, "connection").attach(async (ws) => {
  if (ws.readyState !== WebSocket.OPEN) {
    await new Promise((resolve) =>
      Evt.from<Event>(ws, "open").attachOnce(resolve),
    );
  }

  const pc = createPeerConnection();
  negotiate(ws, pc, { RTCSessionDescription });
  const channels: Set<RTCDataChannel> = new Set();

  Evt.from<RTCDataChannelEvent>(pc, "datachannel").attach(
    ({ type, channel }) => {
      console.log(type, channel.label, channel.readyState);

      channels.add(channel);

      Evt.merge([
        Evt.from<Event>(channel, "close"),
        Evt.from<RTCErrorEvent>(channel, "error"),
      ]).attachOnce(() => channels.delete(channel));

      Evt.from<MessageEvent>(channel, "message").attach(({ data }) => {
        for (const channel of channels) {
          if (channel.readyState === "open") {
            channel.send(data);
          } else {
            channels.delete(channel);
          }
        }
      });
    },
  );
});

httpServer.listen(8080, () => console.log("Server listening on 8080"));
