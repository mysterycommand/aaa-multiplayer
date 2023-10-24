import { Evt } from "evt";
import { negotiate } from "../shared/negotiate.js";
import { rtcConfiguration } from "../shared/rtcConfiguration.js";
import { store } from "../shared/state/store.js";
import type { Action } from "../shared/state/types.js";
import { createAction } from "./createAction.js";

const createWebSocket = (...args: ConstructorParameters<typeof WebSocket>) =>
  new WebSocket(...args);
const createPeerConnection = () => new RTCPeerConnection(rtcConfiguration);

const { hostname, protocol } = location;
const ws = createWebSocket(
  `${protocol.replace("http", "ws")}//${hostname}:8080`,
);
const pc = createPeerConnection();

Evt.from<Event>(ws, "open").attachOnce(async () => {
  negotiate(ws, pc, { RTCSessionDescription });
  const channel = pc.createDataChannel("aaa-multiplayer");

  Evt.merge([
    Evt.from<Event>(channel, "close"),
    Evt.from<Event>(channel, "error"),
  ]).attachOnce(console.error);

  Evt.from<MessageEvent>(channel, "message").attach(({ data }) => {
    if (typeof data !== "string") {
      return;
    }

    try {
      const action: Action = JSON.parse(data);
      store.dispatch(action);
      console.log(action);
    } catch (error) {
      console.error(error);
    }
  });

  if (channel.readyState !== "open") {
    await new Promise((resolve) =>
      Evt.from<Event>(channel, "open").attachOnce(resolve),
    );
  }

  channel.send(JSON.stringify(createAction("connect")));
});

Object.defineProperty(window, "store", { value: store });
