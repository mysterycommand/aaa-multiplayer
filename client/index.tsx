import { Evt } from "evt";
import { negotiate } from "../shared/negotiate.js";
import { rtcConfiguration } from "../shared/rtcConfiguration.js";
import type { Action } from "../shared/state/types.js";
import { createAction } from "./createAction.js";
import { useStore } from "./useStore.js";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";

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

  const clientSend = (action: Action) => {
    useStore.dispatch(action);
    channel.send(JSON.stringify(action));
  };

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
      useStore.dispatch(action);
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

  Evt.merge([
    Evt.from<PointerEvent>(document, "pointerenter", { capture: true }),
    Evt.from<PointerEvent>(document, "pointerover", { capture: true }),
    Evt.from<PointerEvent>(document, "pointerdown", { capture: true }),
  ]).attach(({ buttons, pointerId, pointerType, x, y }) =>
    clientSend(
      createAction("pointerstart", {
        pointerId,
        pointerType,
        isDown:
          (pointerType === "mouse" && buttons !== 0) ||
          pointerType === "touch" ||
          pointerType === "pen",
        x: x - window.innerWidth / 2,
        y: y - window.innerHeight / 2,
      }),
    ),
  );

  Evt.merge([
    Evt.from<PointerEvent>(document, "pointerleave", { capture: true }),
    Evt.from<PointerEvent>(document, "pointerout", { capture: true }),
    Evt.from<PointerEvent>(document, "pointerup", { capture: true }),
  ]).attach(({ type, buttons, pointerId, pointerType, x, y }) =>
    clientSend(
      type === "pointerup" && pointerType === "mouse"
        ? createAction("pointermove", {
            pointerId,
            pointerType,
            isDown: buttons !== 0,
            x: x - window.innerWidth / 2,
            y: y - window.innerHeight / 2,
          })
        : createAction("pointerend", { pointerId }),
    ),
  );

  Evt.from<PointerEvent>(document, "pointermove", { capture: true }).attach(
    ({ buttons, pointerId, pointerType, x, y }) =>
      clientSend(
        createAction("pointermove", {
          pointerId,
          pointerType,
          isDown:
            (pointerType === "mouse" && buttons !== 0) ||
            pointerType === "touch" ||
            pointerType === "pen",
          x: x - window.innerWidth / 2,
          y: y - window.innerHeight / 2,
        }),
      ),
  );

  clientSend(createAction("connect"));
});

Object.defineProperty(window, "store", { value: useStore });
createRoot(document.querySelector("main")!).render(<App />);
