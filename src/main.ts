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
  'ed7245a0-0928-4a49-aa00-0633f5a5356a', 
  '7e85b7b0-a5ee-4f2c-bf4b-6ad6768590ab'
);
await session.applyLens(lens);


})();
