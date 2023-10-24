import { produce } from "immer";
import { devtools } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { reducer } from "./reducer.js";
import { redux } from "./redux.js";
import { withRollback } from "./withRollback.js";

export const store = createStore(
  devtools(redux(produce(withRollback(reducer)), {}), {
    enabled: process.env.NODE_ENV === "development" && "window" in globalThis,
  }),
);
