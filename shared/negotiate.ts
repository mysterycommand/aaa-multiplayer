import { Evt } from "evt";
import type { WebSocketish } from "./types.js";

const isServer = "process" in globalThis;
const isDebug = false;

export const negotiate = (
  ws: WebSocketish,
  pc: RTCPeerConnection,
  {
    RTCSessionDescription,
  }: {
    RTCSessionDescription: typeof globalThis.RTCSessionDescription;
  },
) => {
  let isOffering = false;

  Evt.merge([
    Evt.from<Event>(pc, "connectionstatechange"),
    Evt.from<Event>(pc, "signallingstatechange"),
  ]).attach(
    (event) =>
      isDebug && console.log(event.type, pc.signalingState, pc.connectionState),
  );

  /**
   * this always starts on the client, and the server accepts all offers
   */
  Evt.from<Event>(pc, "negotiationneeded").attach(async () => {
    isDebug && console.log("negotiationneeded");

    try {
      isOffering = true;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(new RTCSessionDescription(offer));

      ws.send(JSON.stringify({ description: pc.localDescription }));
    } catch (error) {
      console.error(error);
    } finally {
      isOffering = false;
    }
  });

  /**
   * ice candidates still feel a little like magic to me, but the peer
   * connection talks to the STUN server to get these and we just need to
   * forward them to the other peer via the signaling channel (web socket)
   */
  Evt.from<RTCPeerConnectionIceEvent>(pc, "icecandidate").attach(
    async ({ candidate }) => {
      isDebug && console.log("icecandidate", { candidate });
      if (candidate === null) return;

      ws.send(JSON.stringify({ candidate }));
    },
  );

  Evt.from<RTCPeerConnectionIceEvent>(pc, "iceconnectionstatechange").attach(
    () => {
      isDebug && console.log("iceconnectionstatechange", pc.iceConnectionState);

      if (pc.iceConnectionState === "failed") {
        pc.restartIce();
      }
    },
  );

  /**
   * the signalling channel handles candidates and descriptions (offers and
   * answers) for both client and server
   */
  Evt.from<MessageEvent>(ws, "message").attach(async ({ type, data }) => {
    isDebug && console.log(type, pc.signalingState, pc.connectionState);

    try {
      const { candidate, description } = JSON.parse(data);
      isDebug && console.log({ candidate, description });

      if (candidate) {
        await pc.addIceCandidate(candidate);
      }

      if (description) {
        await pc.setRemoteDescription(description);

        if (description.type === "offer") {
          if (!isServer && (isOffering || pc.signalingState !== "stable")) {
            return;
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(new RTCSessionDescription(answer));

          ws.send(JSON.stringify({ description: pc.localDescription }));
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
};
