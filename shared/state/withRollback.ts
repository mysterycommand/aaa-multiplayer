import { current } from "immer";
import mergeWith from "lodash-es/mergeWith.js";
import type { Action, Enhancer, State } from "./types.js";

const isSettledBy = (a: Action, b: Action): boolean =>
  a.type === b.type &&
  a.meta.clientId === b.meta.clientId &&
  a.meta.clientActionIndex === b.meta.clientActionIndex;

const removeMissing = (obj: any, src: any) => {
  if (Array.isArray(obj)) {
    obj.length = src.length;
  }

  if (typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      if (!src[key]) {
        delete obj[key];
      }
    });
  }

  return src;
};

export const withRollback: Enhancer = (reducer) => {
  type Pair = [State, Action];
  const pendingPairs: Pair[] = [];
  const settledPairs: Pair[] = [];

  return (draft, action) => {
    if (action.meta.source === "client") {
      reducer(draft, action);
      pendingPairs.push([structuredClone(current(draft)), action]);
      return;
    }

    if (action.type === "sync") {
      Object.assign(draft, action.payload);
      pendingPairs.length = 0;
      settledPairs.length = 0;
      settledPairs.push([structuredClone(current(draft)), action]);
      return;
    }

    // create new settled state
    const settledState = settledPairs.at(-1)![0];
    reducer(settledState, action);
    settledPairs.push([structuredClone(settledState), action]);

    // check for pending actions that are now settled
    const settlingPair = pendingPairs.find(([, pendingAction]) =>
      isSettledBy(action, pendingAction),
    );

    if (settlingPair) {
      pendingPairs.splice(pendingPairs.indexOf(settlingPair), 1);
    }

    // replay pending
    pendingPairs.forEach(([, pendingAction], i, pairs) => {
      // rerun our predictions based on the new settled state
      const pendingState = i === 0 ? settledState : pairs[i - 1]![0];

      reducer(pendingState, pendingAction);

      // update/mutate our forecasts in place
      pairs[i]![0] = structuredClone(pendingState);
    });

    // apply the latest pending state
    const next = pendingPairs.at(-1)?.[0] ?? settledPairs.at(-1)![0];
    mergeWith(draft, next, removeMissing);
  };
};
