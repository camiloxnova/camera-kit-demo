import { bootstrapCameraKit, createMediaStreamSource } from '@snap/camera-kit';

const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;
const videoContainer = document.getElementById(
  'video-container'
) as HTMLElement;
const videoTarget = document.getElementById('video') as HTMLVideoElement;
const startRecordingButton = document.getElementById(
  'start'
) as HTMLButtonElement;
const stopRecordingButton = document.getElementById(
  'stop'
) as HTMLButtonElement;
const downloadButton = document.getElementById('download') as HTMLButtonElement;

let mediaRecorder: MediaRecorder;
let downloadUrl: string;

async function init() {
  const cameraKit = await bootstrapCameraKit({
    apiToken: import.meta.env.VITE_API_TOKEN,
  });

  const session = await cameraKit.createSession({ liveRenderTarget });

  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  const source = createMediaStreamSource(mediaStream);

  await session.setSource(source);
  await session.play();

  const lens = await cameraKit.lensRepository.loadLens(
  'ed7245a0-0928-4a49-aa00-0633f5a5356a', 
  '7e85b7b0-a5ee-4f2c-bf4b-6ad6768590ab'
);
await session.applyLens(lens);

  bindRecorder();
}

function bindRecorder() {
  startRecordingButton.addEventListener('click', () => {
    startRecordingButton.disabled = true;
    stopRecordingButton.disabled = false;
    downloadButton.disabled = true;
    videoContainer.style.display = 'none';

    const mediaStream = liveRenderTarget.captureStream(30);

    mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (!event.data.size) {
        console.warn('No recorded data available');
        return;
      }

      const blob = new Blob([event.data]);

      downloadUrl = window.URL.createObjectURL(blob);
      downloadButton.disabled = false;

      videoTarget.src = downloadUrl;
      videoContainer.style.display = 'block';
    });

    mediaRecorder.start();
  });

  stopRecordingButton.addEventListener('click', () => {
    startRecordingButton.disabled = false;
    stopRecordingButton.disabled = true;

    mediaRecorder?.stop();
  });

  downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');

    link.setAttribute('style', 'display: none');
    link.href = downloadUrl;
    link.download = 'camera-kit-web-recording.webm';
    link.click();
    link.remove();
  });
}

init();