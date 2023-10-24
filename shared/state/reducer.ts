import type { Json, Reducer } from "./types.js";

export const reducer: Reducer = (state, action) => {
  switch (action.type) {
    case "randomize": {
      return;
    }

    case "connect": {
      if (!action.meta.clientId) {
        throw new Error(
          `"connect" action requires ClientMeta, but got ${action.meta}`,
        );
      }

      state.clients || (state.clients = {});
      (state.clients as { [key: string]: Json })[action.meta.clientId] = {
        pointers: {},
      };
      return;
    }
  }
};
