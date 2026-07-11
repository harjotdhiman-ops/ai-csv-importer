const express = require("express");
const router = express.Router();

const upload = require("../utils/upload");
const { importCSV } = require("../controllers/importController");

router.post(
  "/",
  upload.single("file"),
  importCSV
);

module.exports = router;

router.get("/test", (req, res) => {
  res.json({ message: "Import route works!" });
});