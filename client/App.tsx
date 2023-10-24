import { useEffect, type FC, useState } from "react";
import { useStore } from "./useStore";

export const App: FC = () => {
  const clients = useStore((state) => state.clients);

  const [[width, height], setSize] = useState([0, 0]);
  useEffect(() => {
    const onResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.dispatchEvent(new UIEvent("resize"));

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`}>
        {clients &&
          Object.entries(clients).map(([clientId, client]) =>
            Object.entries(client.pointers).map(([pointerId, { x, y }]) => (
              <circle
                key={`${clientId}:${pointerId}`}
                cx={x + width / 2}
                cy={y + height / 2}
                r={10}
                fill={`#${clientId}`}
              />
            )),
          )}
      </svg>
      <h1>AAA Multiplayer</h1>
    </>
  );
};
