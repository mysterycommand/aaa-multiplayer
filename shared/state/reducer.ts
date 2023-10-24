import type { Reducer } from "./types.js";

export const reducer: Reducer = (state, action) => {
  switch (action.type) {
    case "randomize": {
      state.value = Math.random();
      return;
    }
  }
};
