import loadInvert from "./invert.js";
import loadGrayscale from "./grayscale.js";

const FILTERS = ["invert", "grayscale"];

(async () => {
  const applyFilters = async (ppmP3String) => {
    const file = new File([ppmP3String], "input.ppm", {
      type: "image/x-portable-bitmap",
    });
    const inputFileName = "input.ppm";
    const buffer = await file.arrayBuffer();
    const InvertFilter = await loadInvert();
    const GrayscaleFilter = await loadGrayscale();
    InvertFilter.FS.writeFile(inputFileName, new Uint8Array(buffer));
    GrayscaleFilter.FS.writeFile(inputFileName, new Uint8Array(buffer));
    const outputFileName = `${Math.random().toString().substr(2)}.ppm`;
    InvertFilter.callMain([inputFileName, `invert-${outputFileName}`]);
    GrayscaleFilter.callMain([inputFileName, `grayscale-${outputFileName}`]);

    FILTERS.forEach(async (filter, i) => {
      const output = (
        filter === "invert" ? InvertFilter : GrayscaleFilter
      ).FS.readFile(`${filter}-${outputFileName}`, { encoding: "binary" });
      const file = new File([output], outputFileName, {
        type: "image/x-portable-bitmap",
      });
      self.postMessage({
        filter,
        ppmP3String: await file.text(),
        complete: i === FILTERS.length - 1,
      });
    });
  };

  self.addEventListener("message", async (event) => {
    const { ppmP3String } = event.data;
    applyFilters(ppmP3String);
  });
})();
