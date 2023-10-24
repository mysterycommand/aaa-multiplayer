export type BaseMeta = {
  source: "client" | "server";
};

export type ClientMeta = BaseMeta & {
  source: "client";
  clientId: string;
  clientNow: number;
  clientActionIndex: number;
};

export type ServerMeta = BaseMeta &
  Pick<ClientMeta, "clientId" | "clientNow" | "clientActionIndex"> & {
    source: "server";
    serverNow: number;
    serverActionIndex: number;
  };

export type Meta = ClientMeta | ServerMeta;

export type BaseAction<T> = T extends void
  ? {
      type: string;
      meta: Meta;
    }
  : {
      type: string;
      meta: Meta;
      payload: T;
    };

export type RandomizeAction = BaseAction<void> & {
  type: "randomize";
};

export type Json =
  | boolean
  | null
  | number
  | string
  | Json[]
  | { [key: string]: Json };

export type SyncAction = BaseAction<Json> & {
  type: "sync";
};

export type State = { [key: string]: Json };
export type Action = RandomizeAction | SyncAction;

export type Reducer = (state: State, action: Action) => void;
export type Enhancer = (reducer: Reducer) => Reducer;
