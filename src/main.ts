import { bootstrapCameraKit } from "@snap/camera-kit";

(async function () {
  const cameraKit = await bootstrapCameraKit({ 
    apiToken: import.meta.env.VITE_API_TOKEN
  });

  const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;

  const session = await cameraKit.createSession({ liveRenderTarget });

  const mediaStream = await navigator.mediaDevices.getUserMedia({	
    video: true,
});

await session.setSource(mediaStream);

await session.play();

const lens = await cameraKit.lensRepository.loadLens(
  'cf6915e2-af58-4bfe-84e0-a1bc6ff5aac2', 
  '7e85b7b0-a5ee-4f2c-bf4b-6ad6768590ab'
);
await session.applyLens(lens);


})();
