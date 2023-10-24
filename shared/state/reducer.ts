import type { Json, Reducer } from "./types.js";

export const reducer: Reducer = (state, action) => {
  switch (action.type) {
    case "randomize": {
      return;
    }

    case "connect": {
      state.clients || (state.clients = {});
      (state.clients as { [key: string]: Json })[action.meta.clientId] = {
        pointers: {},
      };
      return;
    }
  }
};
