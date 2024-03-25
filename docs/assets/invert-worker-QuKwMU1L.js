import loadInvert from './invert.js';

const MIME_TYPE = 'image/x-portable-bitmap';

(async () => {
  const applyFilter = async (ppmP3String) => {
    const InvertFilter = await loadInvert();
    const inputFileName = 'input.ppm';
    const outputFileName = `${Math.random().toString().substr(2)}.ppm`;
    const inputFile = new File([ppmP3String], inputFileName, {
      type: MIME_TYPE,
    });
    const buffer = await inputFile.arrayBuffer();
    InvertFilter.FS.writeFile(inputFileName, new Uint8Array(buffer));
    performance.mark('invert-start');
    InvertFilter.callMain([inputFileName, `invert-${outputFileName}`]);
    performance.mark('invert-end');
    performance.measure('Apply invert filter', 'invert-start', 'invert-end');
    const output = InvertFilter.FS.readFile(`invert-${outputFileName}`, {
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
