import loadInvert from './invert.js';
import loadGrayscale from './grayscale.js';

(async () => {
  const InvertFilter = await loadInvert();
  const GrayscaleFilter = await loadGrayscale();

  const video = document.getElementById('video');
  const photos = document.getElementById('photos');
  const captureButton = document.getElementById('capture');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', {
    willReadFrequently: true,
  });

  let streaming = false;

  const applyFilters = async (ppmP3String) => {
    const file = new File([ppmP3String], 'input.ppm', {
      type: 'image/x-portable-bitmap',
    });
    const inputFileName = 'input.ppm';
    const buffer = await file.arrayBuffer();
    InvertFilter.FS.writeFile(inputFileName, new Uint8Array(buffer));
    GrayscaleFilter.FS.writeFile(inputFileName, new Uint8Array(buffer));
    const outputFileName = `${Math.random().toString().substr(2)}.ppm`;
    InvertFilter.callMain([inputFileName, `invert-${outputFileName}`]);
    GrayscaleFilter.callMain([inputFileName, `grayscale-${outputFileName}`]);

    ['invert-', 'grayscale-'].forEach(async (filter) => {
      const output = (
        filter === 'invert-' ? InvertFilter : GrayscaleFilter
      ).FS.readFile(`${filter}${outputFileName}`, { encoding: 'binary' });
      const file = new File([output], outputFileName, {
        type: 'image/x-portable-bitmap',
      });
      drawPPMP3Image(await file.text());
    });
  };

  async function drawPPMP3Image(ppmP3String) {
    const lines = ppmP3String.split('\n');
    const dataLines = lines.filter(
      (line) => line[0] !== '#' && line.trim() !== '',
    );
    const width = parseInt(dataLines[1].split(' ')[0], 10);
    const height = parseInt(dataLines[1].split(' ')[1], 10);
    const pixels = dataLines
      .splice(3)
      .join('\n')
      .split(/\s+/g)
      .map((pixel) => parseInt(pixel, 10));
    const imageData = new ImageData(width, height);
    for (let i = 0, j = 0; i < pixels.length; i += 3) {
      imageData.data[j + 0] = pixels[i + 0]; // Red
      imageData.data[j + 1] = pixels[i + 1]; // Green
      imageData.data[j + 2] = pixels[i + 2]; // Blue
      imageData.data[j + 3] = 255; // Alpha
      j += 4;
    }
    const bitmap = await createImageBitmap(imageData);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    photos.append(canvas);
  }

  async function setupCamera() {
    return new Promise(async (resolve, reject) => {
      try {
        const constraints = {
          video: { facingMode: 'user' },
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

    const ppmP3String = ppmData + ppmBody;
    await applyFilters(ppmP3String);
    captureButton.classList.remove('busy');
  });
})();
