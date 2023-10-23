import { Draft, produce } from "immer";
import { create } from "zustand";
import { devtools, redux } from "zustand/middleware";

export type State = Record<PropertyKey, string>;

export type Action = {
  type: "test" | "real";
};

const reducer = produce((draft: Draft<State>, action: Action): void => {
  switch (action.type) {
    case "test": {
      draft.value = "test";
      return;
    }

    case "real": {
      draft.value = "real";
      return;
    }
  }
});

export const useStore = create<State>()(devtools(redux(reducer, {}), {
  enabled: "window" in globalThis,
}));
