import { useEffect } from "preact/hooks";

export const Negotiate = () => {
  useEffect(() => {
    const { protocol, host } = location;
    const socket = new WebSocket(
      `${protocol.replace("http", "ws")}//${host}/api/socket`,
    );
    const onOpen = ({ type }: Event) => console.log(type);
    socket.addEventListener("open", onOpen);
    return () => socket.removeEventListener("open", onOpen);
  }, []);

  return null;
};
