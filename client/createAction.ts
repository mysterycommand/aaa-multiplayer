import type { Action, Json } from "../shared/state/types.js";
import { randomHex } from "./randomHex.js";

const clientId = randomHex();
let actionIndex = 0;

export const createAction = (type: Action["type"], payload?: Json): Action => ({
  type,
  meta: {
    source: "client",
    clientId,
    clientNow: Date.now(),
    clientActionIndex: actionIndex++,
  },
  payload,
});
