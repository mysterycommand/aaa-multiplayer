import type { Action } from "../shared/state/types.js";

export const broadcast = (
  channels: Iterable<RTCDataChannel>,
  action: Action,
) => {
  // store.dispatch(action);

  const actionJson = JSON.stringify(action);

  for (const channel of channels) {
    if (channel.readyState === "open") {
      channel.send(actionJson);
    }
  }
};
