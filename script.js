const video = document.getElementById('video');
const photos = document.getElementById('photos');
const captureButton = document.getElementById('capture');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', {
  willReadFrequently: true,
});

let streaming = false;

const workers = {
  invert: null,
  grayscale: null,
};

const drawPPMP3Image = async (ppmP3String, filter) => {
  performance.mark('draw-start');
  const dataLines = ppmP3String.split('\n');
  const width = parseInt(dataLines[1].split(' ')[0], 10);
  const height = parseInt(dataLines[1].split(' ')[1], 10);
  const pixels = dataLines
    .splice(3)
    .join('\n')
    .split(' ')
    .map((pixel) => parseInt(pixel, 10));
  const imageData = new ImageData(width, height);
  for (let i = 0, j = 0; i < pixels.length; i += 3) {
    imageData.data[j + 0] = pixels[i + 0]; // Red
    imageData.data[j + 1] = pixels[i + 1]; // Green
    imageData.data[j + 2] = pixels[i + 2]; // Blue
    imageData.data[j + 3] = 255; // Alpha
    j += 4;
  }
  const imageBitmap = await createImageBitmap(imageData);
  const imageCanvas = document.createElement('canvas');
  imageCanvas.width = width;
  imageCanvas.height = height;
  const imageCtx = imageCanvas.getContext('2d');
  imageCtx.drawImage(imageBitmap, 0, 0);
  photos.append(imageCanvas);
  performance.mark('draw-end');
  performance.measure(`Draw ${filter} image`, 'draw-start', 'draw-end');
};

async function setupCamera() {
  return new Promise(async (resolve, reject) => {
    try {
      const isPortrait = screen.orientation.type.startsWith('portrait');
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: isPortrait ? 480 : 640 },
          height: { ideal: isPortrait ? 640 : 480 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.addEventListener('canplay', () => {
        if (!streaming) {
          const height = video.videoHeight;
          const width = video.videoWidth;
          video.width = width;
          video.height = height;
          canvas.width = width;
          canvas.height = height;
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
          streaming = true;
        }
        resolve();
      });
      video.srcObject = stream;
    } catch (err) {
      reject(err);
    }
  });
}

captureButton.addEventListener('click', async () => {
  photos.innerHTML = '';

  if (!video.srcObject) {
    try {
      await setupCamera();
      return;
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert(`Error accessing camera: ${err}`);
      return;
    }
  }

  captureButton.classList.add('busy');

  performance.mark('ppm-start');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const ppmData = `P3\n${canvas.width} ${canvas.height}\n255\n`;
  const ppmBody = Array.from(imageData.data).reduce((acc, val, index) => {
    // Skip the alpha channel.
    if ((index + 1) % 4 !== 0) {
      acc += `${val} `;
    }
    return acc;
  }, '');
  const ppmP3String = `${ppmData}${ppmBody}`;
  performance.mark('ppm-end');
  performance.measure('Prepare webcam image', 'ppm-start', 'ppm-end');

  let complete = 0;
  performance.mark('filters-start');

  for (const [filter, worker] of Object.entries(workers)) {
    if (worker) {
      worker.terminate();
      workers[filter] = null;
    }
    workers[filter] = new Worker(
      new URL('./filter-worker.js', import.meta.url),
      {
        type: 'module',
      },
    );
    workers[filter].addEventListener('message', async (event) => {
      complete += 1;
      const { ppmP3String } = event.data;
      await drawPPMP3Image(ppmP3String, 'invert');
      if (complete === 2) {
        performance.mark('filters-end');
        performance.measure('Apply filters', 'filters-start', 'filters-end');
        complete = 0;
        captureButton.classList.remove('busy');
        performance.getEntriesByType('measure').forEach((measure) => {
          console.log(measure.name, measure.duration.toFixed(0));
        });
      }
      workers[filter].terminate();
      workers[filter] = null;
    });
    workers[filter].postMessage({ ppmP3String, filter });
  }
});
