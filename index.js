const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
// app.use(cors())
require("dotenv").config();

const generateScriptsRouter = require("./generateScriptsRouter");

app.use(express.static("scripts"));

app.use('/generate', generateScriptsRouter);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
