import loadInvert from './invert.js';

(async () => {
  const applyFilter = async (ppmP3String) => {
    const inputFile = new File([ppmP3String], 'input.ppm', {
      type: 'image/x-portable-bitmap',
    });
    const inputFileName = 'input.ppm';
    const buffer = await inputFile.arrayBuffer();
    const InvertFilter = await loadInvert();
    InvertFilter.FS.writeFile(inputFileName, new Uint8Array(buffer));
    const outputFileName = `${Math.random().toString().substr(2)}.ppm`;
    performance.mark('invert-start');
    InvertFilter.callMain([inputFileName, `invert-${outputFileName}`]);
    performance.mark('invert-end');
    performance.measure('Apply invert filter', 'invert-start', 'invert-end');
    const output = InvertFilter.FS.readFile(`invert-${outputFileName}`, {
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
