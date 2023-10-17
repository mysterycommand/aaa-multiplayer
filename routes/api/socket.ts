import { HandlerContext } from "$fresh/server.ts";

export const handler = (request: Request, _ctx: HandlerContext): Response => {
  const { socket, response } = Deno.upgradeWebSocket(request);
  socket.addEventListener("open", ({ type }) => console.log(type));
  return response;
};
