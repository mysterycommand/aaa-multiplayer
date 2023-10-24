import { type StateCreator, type StoreMutatorIdentifier } from "zustand";
import { type NamedSet } from "zustand/middleware";
import type { Action } from "./types.js";

/**
 * these types are kinda complicated, but based on Zustand's docs for
 * "Middleware that changes the store type" and relies on a "higher-kinded
 * mutator" abstraction
 *
 * @see https://docs.pmnd.rs/zustand/guides/typescript#middleware-that-changes-the-store-type
 * @see https://github.com/pmndrs/zustand/issues/710
 */
type Write<T, U> = Omit<T, keyof U> & U;

type WithRedux<A> = {
  dispatch: (a: A) => A;
  dispatchFromDevtools: true;
};

declare module "zustand" {
  interface StoreMutators<S, A> {
    "custom/redux": Write<S, WithRedux<A>>;
  }
}

type Redux = <T, Cms extends [StoreMutatorIdentifier, unknown][] = []>(
  reducer: (state: T, action: Action) => T,
  initialState: T,
) => StateCreator<T, Cms, [["custom/redux", Action]]>;

export const redux: Redux = (reducer, initialState) => (set, _get, api) => {
  /**
   * n.b. this is a re-implementation of Zustand's redux middleware, but does
   * not add `dispatch` to state
   *
   * @see https://github.com/pmndrs/zustand/blob/main/src/middleware/redux.ts
   */
  const dispatch = (action: Action) => {
    /**
     * n.b. `NamedSet` comes from the devtools middleware, and accepts an
     * action as an additional/last argument to `set` that gets logged to
     * Redux devtools
     */
    (set as NamedSet<typeof initialState>)(
      (state) => reducer(state, action),
      false,
      action,
    );

    return action;
  };

  Object.assign(api, {
    dispatch,
    dispatchFromDevtools: true,
  });

  return initialState;
};
