import { bootstrapCameraKit } from "@snap/camera-kit";

(async function () {
  const cameraKit = await bootstrapCameraKit({ 
    apiToken: 
      'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzQ5MTM0MzE2LCJzdWIiOiJiMjg1M2UyMC1hODFmLTQ2ZDEtODRkMS1kMDBjNzQ3M2U4NGZ-U1RBR0lOR35lYmY3ZmU0ZC0zMWU1LTQxZjYtODZjNi04MTZiNTU2ZTQ4NzEifQ.z1wu7S3aC0dIAHNDT2Av60sxhA8i36Q7EeCwvP9Ar4g' 
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
