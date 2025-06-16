import {
  bootstrapCameraKit,
  CameraKitSession,
  createMediaStreamSource,
  Transform2D,
} from '@snap/camera-kit';

const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;
const videoContainer = document.getElementById('video-container') as HTMLElement;
const videoTarget = document.getElementById('video') as HTMLVideoElement;
const downloadButton = document.getElementById('download') as HTMLButtonElement;
const recordBtn = document.getElementById('record-btn') as HTMLButtonElement;
const recordIcon = document.getElementById('record-icon');
const flipCamera = document.getElementById('flip') as HTMLSpanElement;
if (!(recordIcon instanceof SVGSVGElement)) {
  throw new Error('record-icon element is not an SVGSVGElement');
}

let isBackFacing = true;
let mediaStream: MediaStream;
let session: CameraKitSession;
let mediaRecorder: MediaRecorder;
let downloadUrl: string;
let isRecording = false;

async function init() {
  // Ajusta el canvas a pantalla completa
  function resizeCanvas() {
    liveRenderTarget.width = window.innerWidth;
    liveRenderTarget.height = window.innerHeight;
    liveRenderTarget.style.width = '100vw';
    liveRenderTarget.style.height = '100vh';
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const cameraKit = await bootstrapCameraKit({
    apiToken: import.meta.env.VITE_API_TOKEN,
  });

  session = await cameraKit.createSession({ liveRenderTarget });

  // Carga un lens (puedes ajustar los IDs si lo necesitas)
  const lens = await cameraKit.lensRepository.loadLens(
    'ed7245a0-0928-4a49-aa00-0633f5a5356a',
    '7e85b7b0-a5ee-4f2c-bf4b-6ad6768590ab'
  );
  await session.applyLens(lens);

  bindFlipCamera(session);
  await updateCamera(session);

  bindRecorder();
}

function bindFlipCamera(session: CameraKitSession) {
  flipCamera.style.cursor = 'pointer';
  flipCamera.style.position = 'fixed';
  flipCamera.style.top = '32px';
  flipCamera.style.right = '32px';
  flipCamera.style.zIndex = '1002';
  flipCamera.style.background = '#fff';
  flipCamera.style.padding = '8px 16px';
  flipCamera.style.borderRadius = '20px';
  flipCamera.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  flipCamera.style.fontWeight = 'bold';

  flipCamera.addEventListener('click', () => {
    updateCamera(session);
  });
}

async function updateCamera(session: CameraKitSession) {
  isBackFacing = !isBackFacing;

  flipCamera.innerText = isBackFacing
    ? 'Switch to Front Camera'
    : 'Switch to Back Camera';

  if (mediaStream) {
    session.pause();
    mediaStream.getVideoTracks()[0].stop();
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: isBackFacing ? 'environment' : 'user',
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  });

  const source = createMediaStreamSource(mediaStream, {
    cameraType: isBackFacing ? 'environment' : 'user',
  });

  await session.setSource(source);

  if (!isBackFacing) {
    source.setTransform(Transform2D.MirrorX);
  }

  session.play();
}

function bindRecorder() {
  recordBtn.addEventListener('click', () => {
    if (!isRecording) {
      // Start recording
      isRecording = true;
      recordBtn.classList.add('recording');
      recordBtn.setAttribute('aria-label', 'Stop Recording');
      // Change icon to stop (square)
      if (recordIcon) {
        recordIcon.innerHTML = '<rect x="16" y="16" width="16" height="16" rx="3" fill="#fff"/>';
      }
      videoContainer.style.display = 'none';
      downloadButton.disabled = true;

      const stream = liveRenderTarget.captureStream(30);
      mediaRecorder = new MediaRecorder(stream);
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
    } else {
      // Stop recording
      isRecording = false;
      recordBtn.classList.remove('recording');
      recordBtn.setAttribute('aria-label', 'Start Recording');
      // Change icon to record (circle)
      if (recordIcon) {
        recordIcon.innerHTML = '<circle cx="24" cy="24" r="18" fill="red"/>';
      }
      mediaRecorder?.stop();
    }
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

recordBtn.disabled = true; // Deshabilita el botón de grabar al inicio

window.addEventListener('DOMContentLoaded', () => {
  const gotItBtn = document.getElementById('got-it-btn');
  const modal1 = document.getElementById('modal-overlay');
  const modal2 = document.getElementById('terms-modal-overlay');
  const acceptBtn = document.getElementById('accept-terms-btn');
  const sheetModal = document.getElementById('sheet-modal-overlay');
  const doneTermsBtn = document.getElementById('done-terms-btn');

  if (gotItBtn && modal1 && modal2 && acceptBtn) {
    gotItBtn.addEventListener('click', () => {
      modal1.style.display = 'none';
      modal2.style.display = 'flex';
    });

    acceptBtn.addEventListener('click', () => {
      modal2.style.display = 'none';
      // Mostrar el sheet modal después de aceptar términos
      if (sheetModal) sheetModal.style.display = 'flex';
    });

    if (doneTermsBtn && sheetModal) {
      doneTermsBtn.addEventListener('click', () => {
        sheetModal.style.display = 'none';
        recordBtn.disabled = false;
        init();
      });
    }
  } else {
    console.error('Algún elemento del modal no fue encontrado.');
  }
});