import type { Action, ClientMeta, Json } from "../shared/state/types.js";

let actionIndex = 0;
export const createAction = (
  type: Action["type"],
  payload: Json,
  meta?: ClientMeta,
): Action => ({
  type,
  payload,
  meta: {
    ...meta,
    source: "server",
    serverNow: Date.now(),
    serverActionIndex: actionIndex++,
  },
});
