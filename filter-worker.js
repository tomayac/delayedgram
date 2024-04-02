(async () => {
  const MIME_TYPE = 'image/x-portable-bitmap';
  const INPUT_NAME = 'input.ppm';
  const OUTPUT_NAME = 'output.ppm';

  const applyFilter = async (ppmP3String, filter) => {
    const WasmFilter = await (await import(`./filter-${filter}.mjs`)).default();
    const buffer = await new File([ppmP3String], INPUT_NAME, {
      type: MIME_TYPE,
    }).arrayBuffer();
    WasmFilter.FS.writeFile(INPUT_NAME, new Uint8Array(buffer));
    performance.mark(`${filter}-start`);
    WasmFilter.callMain([INPUT_NAME, OUTPUT_NAME]);
    performance.mark(`${filter}-end`);
    performance.measure(
      `Apply ${filter} filter`,
      `${filter}-start`,
      `${filter}-end`,
    );
    const output = WasmFilter.FS.readFile(OUTPUT_NAME, {
      encoding: 'binary',
    });
    const outputFile = new File([output], OUTPUT_NAME, {
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
    const { ppmP3String, filter } = event.data;
    applyFilter(ppmP3String, filter);
  });
})();
