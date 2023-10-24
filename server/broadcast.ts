import type { Action } from "../shared/state/types.js";
import { store } from "./store.js";
import { createAction } from "./createAction.js";

export const broadcast = (
  channels: Iterable<RTCDataChannel>,
  action: Action,
) => {
  const serverAction = createAction(action.type, action.payload, action.meta);
  store.dispatch(serverAction);

  const actionJson = JSON.stringify(serverAction);

  for (const channel of channels) {
    if (channel.readyState === "open") {
      channel.send(actionJson);
    }
  }
};
