const parseCSV = require("../utils/csvParser");
const extractCRM = require("../services/aiService");

exports.importCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV uploaded",
      });
    }

    const records = await parseCSV(req.file.buffer);

    // Process a small batch first
const BATCH_SIZE = 20;

let allRecords = [];

for (let i = 0; i < records.length; i += BATCH_SIZE) {
  const batch = records.slice(i, i + BATCH_SIZE);

  console.log(`Processing batch ${i / BATCH_SIZE + 1}`);

  const parsed = await extractCRM(batch);

  allRecords.push(...parsed);
}

res.json({
  success: true,
  totalRows: records.length,
  imported: allRecords.length,
  skipped: records.length - allRecords.length,
  records: allRecords,
});

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};