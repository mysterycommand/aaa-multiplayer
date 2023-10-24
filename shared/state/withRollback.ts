import type { Action, Enhancer, State } from "./types.js";

export const withRollback: Enhancer = (reducer) => {
  const pendingActions: Map<string, Action> = new Map();
  const settledActions: Map<string, Action> = new Map();

  return (state, action) => {
    if (action.meta.source === "client") {
      reducer(state, action);
      pendingActions.set(
        `${action.meta.clientActionIndex}::${action.meta.clientId}`,
        action,
      );
      return;
    }

    if (action.type === "sync") {
      Object.assign(state, action.payload);
      pendingActions.clear();
      settledActions.clear();
      return;
    }

    // settle action
    // replay pending
  };
};
