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

      if (action.meta.source === "client") {
        state.self = action.meta.clientId;
      }

      state.clients || (state.clients = {});
      state.clients[action.meta.clientId] = {
        pointers: {},
      };
      return;
    }

    case "disconnect": {
      if (!action.meta.clientId) {
        throw new Error(
          `"connect" action requires ClientMeta, but got ${action.meta}`,
        );
      }

      if (action.meta.source === "client") {
        delete state.self;
      }

      delete state.clients[action.meta.clientId];
      return;
    }

    case "pointerstart":
    case "pointermove": {
      if (!action.meta.clientId) {
        throw new Error(
          `"connect" action requires ClientMeta, but got ${action.meta}`,
        );
      }

      const { pointerId, pointerType, isDown, x, y } = action.payload;

      state.clients || (state.clients = {});
      state.clients[action.meta.clientId] ||
        (state.clients[action.meta.clientId] = {
          pointers: {},
        });
      state.clients[action.meta.clientId]!.pointers[pointerId] = {
        pointerId,
        pointerType,
        isDown,
        x,
        y,
      };
      return;
    }

    case "pointerend": {
      if (!action.meta.clientId) {
        throw new Error(
          `"connect" action requires ClientMeta, but got ${action.meta}`,
        );
      }

      const { pointerId } = action.payload;
      delete state.clients[action.meta.clientId]?.pointers[pointerId];
      return;
    }
  }
};
