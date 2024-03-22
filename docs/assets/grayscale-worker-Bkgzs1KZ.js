import loadGrayscale from './grayscale.js';

(async () => {
  const applyFilter = async (ppmP3String) => {
    const inputFile = new File([ppmP3String], 'input.ppm', {
      type: 'image/x-portable-bitmap',
    });
    const inputFileName = 'input.ppm';
    const buffer = await inputFile.arrayBuffer();
    const GrayscaleFilter = await loadGrayscale();
    GrayscaleFilter.FS.writeFile(inputFileName, new Uint8Array(buffer));
    const outputFileName = `${Math.random().toString().substr(2)}.ppm`;
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
      type: 'image/x-portable-bitmap',
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
