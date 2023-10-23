import { useEffect } from "preact/hooks";
import { useStore } from "../state/useStore.ts";

const { dispatch } = useStore;

export const State = () => {
  const state = useStore();

  useEffect(() => {
    const timeoutId = setTimeout(() => dispatch({ type: "real" }), 1_000);
    return () => clearTimeout(timeoutId);
  }, []);

  return <pre>{JSON.stringify(state, null, 2)}</pre>;
};
