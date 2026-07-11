const csv = require("csv-parser");
const { Readable } = require("stream");

function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];

    Readable.from(buffer)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

module.exports = parseCSV;