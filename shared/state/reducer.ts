type BaseMeta = {
  source: "client" | "server";
};

type ClientMeta = BaseMeta & {
  source: "client";
  clientId: string;
  clientNow: number;
  clientActionIndex: number;
};

type ServerMeta = BaseMeta &
  Pick<ClientMeta, "clientId" | "clientNow" | "clientActionIndex"> & {
    source: "server";
    serverNow: number;
    serverActionIndex: number;
  };

type Meta = ClientMeta | ServerMeta;

type BaseAction<T> = T extends void
  ? {
      type: string;
      meta: Meta;
    }
  : {
      type: string;
      meta: Meta;
      payload: T;
    };

type RandomizeAction = BaseAction<void> & {
  type: "randomize";
};

type Json = boolean | null | number | string | Json[] | { [key: string]: Json };

type SyncAction = BaseAction<Json> & {
  type: "sync";
};

type State = { [key: string]: Json };
type Action = RandomizeAction | SyncAction;

type Reducer = (state: State, action: Action) => void;
export const reducer: Reducer = (state, action) => {
  switch (action.type) {
    case "randomize": {
      state.value = Math.random();
      return;
    }
  }
};

type Enhancer = (reducer: Reducer) => Reducer;
export const withRollback: Enhancer = (reducer) => {
  const pendingActions: Map<string, Action> = new Map();
  let settledState: State;

  return (state, action) => {
    if (action.meta.source === "client") {
      reducer(state, action);
      pendingActions.set(
        `${action.meta.clientActionIndex}::${action.meta.clientId}`,
        action
      );
      return;
    }

    if (action.type === "sync") {
      Object.assign(state, action.payload);
      settledState = structuredClone(state);
      pendingActions.clear();
      return;
    }

    // settle action
    // replay pending
  };
};
