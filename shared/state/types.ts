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
  Partial<Pick<ClientMeta, "clientId" | "clientNow" | "clientActionIndex">> & {
    source: "server";
    serverNow: number;
    serverActionIndex: number;
  };

export type Meta = ClientMeta | ServerMeta;

export type BaseAction = {
  type: string;
  meta: Meta;
  payload?: Json;
};

export type ClientAction = BaseAction & {
  meta: ClientMeta;
};

export type ServerAction = BaseAction & {
  meta: ServerMeta;
};

export type RandomizeAction = BaseAction & {
  type: "randomize";
};

export type Json =
  | boolean
  | null
  | number
  | string
  | Json[]
  | { [key: string]: Json };

export type SyncAction = ServerAction & {
  type: "sync";
};

export type ConnectAction = ClientAction & {
  type: "connect";
};

export type State = { [key: string]: Json };
export type Action = RandomizeAction | SyncAction | ConnectAction;

export type Reducer = (state: State, action: Action) => void;
export type Enhancer = (reducer: Reducer) => Reducer;
