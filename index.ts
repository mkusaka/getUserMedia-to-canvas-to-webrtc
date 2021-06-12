declare global {
  interface HTMLCanvasElement {
    captureStream(frameRate?: number): MediaStream;
  }

  interface Window {
    stream: MediaStream | null;
  }
}
import Peer from "skyway-js";
import { create } from "simple-drawing-board";

const video = document.getElementById("video") as HTMLVideoElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const peerId = document.getElementById("my-id") as HTMLParagraphElement;
const makeCall = document.getElementById("make-call") as HTMLButtonElement;
const theirVideo = document.getElementById("their-video") as HTMLVideoElement;
const theirIdInput = document.getElementById("their-id") as HTMLInputElement;
const scaleInButton = document.getElementById("scale-in") as HTMLButtonElement;
const scaleOutButton = document.getElementById(
  "scale-out"
) as HTMLButtonElement;

const canvas2DContext = canvas.getContext("2d");

const sdb = create(canvas);
const redraw = () => {
  sdb.fillImageByElement(video, { isOverlay: true });
  //   canvas.height = video.videoHeight;
  //   canvas.width = video.videoWidth;
  //   canvas2DContext?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  //   canvas2DContext?.beginPath();
  //   canvas2DContext?.moveTo(30, 96);
  //   canvas2DContext?.lineTo(70, 66);
  //   canvas2DContext?.lineTo(103, 76);
  //   canvas2DContext?.lineTo(170, 15);
  //   canvas2DContext?.stroke();
  requestAnimationFrame(redraw);
};

/**
 * webrtc(skyway-js)
 */
(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  video.srcObject = stream;
  // @ts-ignore for debug console
  window.stream = stream;
  //   setTimeout(redraw, 5000);
  requestAnimationFrame(redraw);
})();

const peer = new Peer({
  key: process.env.SKYWAY_KEY!,
  debug: 3,
});

peer.on("open", () => {
  peerId.textContent = `my id: ${peer.id}`;
});

makeCall.onclick = () => {
  const theirId = theirIdInput.value;
  const canvasStream = canvas.captureStream();
  // note: captureStream is experimental(Working Draft) feature. see: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream
  const mediaConnection = peer.call(theirId, canvasStream);
  mediaConnection.on("stream", (stream) => {
    theirVideo.srcObject = stream;
  });
};

peer.on("call", (mediaConnection) => {
  // @ts-ignore window.stream exists;
  mediaConnection.answer(window.stream);
  mediaConnection.on("stream", (stream) => {
    theirVideo.srcObject = stream;
  });
});

/**
 * canvas drawing something.
 */
// sdb.fillImageByElement(videoElement)

scaleInButton.onclick = () => {
  // zoom in.
  // https://jsfiddle.net/bc_rikko/u1uas645/
  canvas2DContext?.scale(1.2, 1.2);
  redraw();
};

scaleOutButton.onclick = () => {
  canvas2DContext?.scale(0.8, 0.8);
  redraw();
};
