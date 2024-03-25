import loadGrayscale from './grayscale.js';

const MIME_TYPE = 'image/x-portable-bitmap';

(async () => {
  const applyFilter = async (ppmP3String) => {
    const GrayscaleFilter = await loadGrayscale();
    const inputFileName = 'input.ppm';
    const outputFileName = `${Math.random().toString().substr(2)}.ppm`;
    const inputFile = new File([ppmP3String], inputFileName, {
      type: MIME_TYPE,
    });
    const buffer = await inputFile.arrayBuffer();
    GrayscaleFilter.FS.writeFile(inputFileName, new Uint8Array(buffer));
    performance.mark('grayscale-start');
    GrayscaleFilter.callMain([inputFileName, `grayscale-${outputFileName}`]);
    performance.mark('grayscale-end');
    performance.measure(
      'Apply grayscale filter',
      'grayscale-start',
      'grayscale-end',
    );
    const output = GrayscaleFilter.FS.readFile(`grayscale-${outputFileName}`, {
      encoding: 'binary',
    });
    const outputFile = new File([output], outputFileName, {
      type: MIME_TYPE,
    });
    self.postMessage({
      ppmP3String: await outputFile.text(),
    });
    performance.getEntriesByType('measure').forEach((measure) => {
      console.log(measure.name, measure.duration.toFixed(0));
    });
  };

  self.addEventListener('message', async (event) => {
    const { ppmP3String } = event.data;
    applyFilter(ppmP3String);
  });
})();
