import { useEffect, type FC, useState } from "react";
import { useStore } from "./useStore";

export const App: FC = () => {
  const self = useStore((state) => state.self);
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
              <path
                key={`${clientId}:${pointerId}`}
                transform={[
                  `translate(${x + width / 2} ${y + height / 2})`,
                  `rotate(${90 + Math.atan2(-y, -x) * (180 / Math.PI)})`,
                ].join(" ")}
                d="M0,0 L8,20 L0,16 L-8,20 Z"
                fill={clientId === self ? `#${clientId}` : "transparent"}
                strokeWidth={clientId === self ? 0 : "2px"}
                stroke={`#${clientId}`}
              />
            )),
          )}
      </svg>
      <h1>AAA Multiplayer</h1>
    </>
  );
};
