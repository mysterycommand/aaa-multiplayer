import { produce } from "immer";
import { createStore } from "zustand/vanilla";
import { reducer } from "../shared/state/reducer.js";
import { redux } from "../shared/state/redux.js";
import { withRollback } from "../shared/state/withRollback.js";

export const store = createStore(redux(produce(withRollback(reducer)), {}));
