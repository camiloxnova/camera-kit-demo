import { bootstrapCameraKit, createMediaStreamSource } from '@snap/camera-kit';

const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;
const videoContainer = document.getElementById('video-container') as HTMLElement;
const videoTarget = document.getElementById('video') as HTMLVideoElement;
const downloadButton = document.getElementById('download') as HTMLButtonElement;
const recordBtn = document.getElementById('record-btn') as HTMLButtonElement;
const recordIcon = document.getElementById('record-icon');
if (!(recordIcon instanceof SVGSVGElement)) {
  throw new Error('record-icon element is not an SVGSVGElement');
}

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

  const session = await cameraKit.createSession({ liveRenderTarget });

  // Usa dimensiones recomendadas para la cámara
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
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