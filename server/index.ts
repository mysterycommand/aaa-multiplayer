import { createServer as createHttpServer } from "node:http";
import { WebSocketServer, type ServerOptions, WebSocket } from "ws";
import * as WebRTC from "node-datachannel/polyfill";
import { rtcConfiguration } from "../shared/rtcConfiguration.js";
import { Evt } from "evt";
import { negotiate } from "../shared/negotiate.js";
import type { Action } from "../shared/state/types.js";
import { broadcast } from "./broadcast.js";
import { createAction } from "./createAction.js";
import { store } from "../shared/state/store.js";

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
    async ({ type, channel }) => {
      console.log(type, channel.label, channel.readyState);

      channels.add(channel);

      Evt.merge([
        Evt.from<Event>(channel, "close"),
        Evt.from<Event>(channel, "error"),
      ]).attachOnce(() => channels.delete(channel));

      Evt.from<MessageEvent>(channel, "message").attach(({ data }) => {
        if (typeof data !== "string") {
          return;
        }

        try {
          const action: Action = JSON.parse(data);
          broadcast(channels, action);
        } catch (error) {
          console.error(error);
        }
      });

      if (channel.readyState !== "open") {
        await new Promise((resolve) =>
          Evt.from<Event>(channel, "open").attachOnce(resolve),
        );
      }

      broadcast([channel], createAction("sync", store.getState()));
    },
  );
});

httpServer.listen(8080, () => console.log("Server listening on 8080"));
