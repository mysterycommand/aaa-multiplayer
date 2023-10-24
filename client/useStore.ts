import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { reducer } from "../shared/state/reducer.js";
import { redux } from "../shared/state/redux.js";
import type { State } from "../shared/state/types.js";
import { withRollback } from "../shared/state/withRollback.js";

declare global {
  const process: {
    env: Record<PropertyKey, string>;
  };
}

export const useStore = create<State>()(
  devtools(redux(produce(withRollback(reducer)), { clients: {} }), {
    enabled: process.env.NODE_ENV === "development" && "window" in globalThis,
  }),
);
