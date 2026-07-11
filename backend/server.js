const express = require("express");
const cors = require("cors");
require("dotenv").config();

const importRoute = require("./routes/importRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/import", importRoute);

console.log("✅ Import route registered");

app.get("/", (req, res) => {
  res.send("Backend Running");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});