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

export type SyncAction = BaseAction & {
  type: "sync";
};

export type ConnectAction = BaseAction & {
  type: "connect";
};

export type DisconnectAction = BaseAction & {
  type: "disconnect";
};

export type Pointer = {
  pointerId: number;
  pointerType: string;
  isDown: boolean;
  x: number;
  y: number;
};

export type PointerAction = BaseAction & {
  payload: Pointer;
};

export type PointerStartAction = PointerAction & {
  type: "pointerstart";
};

export type PointerMoveAction = PointerAction & {
  type: "pointermove";
};

export type PointerEndAction = PointerAction & {
  type: "pointerend";
};

export type State = Record<PropertyKey, any> & {
  clients: {
    [key: PropertyKey]: {
      pointers: {
        [key: PropertyKey]: Pointer;
      };
    };
  };
};
export type Action =
  | RandomizeAction
  | SyncAction
  | ConnectAction
  | DisconnectAction
  | PointerStartAction
  | PointerMoveAction
  | PointerEndAction;

export type Reducer = (state: State, action: Action) => void;
export type Enhancer = (reducer: Reducer) => Reducer;
