import type { Action, Json, Meta, Pointer } from "../shared/state/types.js";

let actionIndex = 0;
export const createAction = <A extends Action>(
  type: Action["type"],
  payload?: Json | Pointer,
  meta?: Meta,
): Action =>
  ({
    type,
    payload,
    meta: {
      ...meta,
      source: "server",
      serverNow: Date.now(),
      serverActionIndex: actionIndex++,
    },
  }) as Action; // TODO: fix this type
