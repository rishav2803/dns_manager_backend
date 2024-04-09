const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const conn = require("./config/database");
const userRouter = require("./routes/UserRoutes");
const domainRouter = require("./routes/domainRoutes");
const recordRouter = require("./routes/recordRoutes");
const cors = require("cors");

require("dotenv").config();

const PORT = process.env.PORT;

conn();

app.use(bodyParser.json());
app.use(cors());

app.use("/user", userRouter);
app.use("/domain", domainRouter);
app.use("/record", recordRouter);

app.get("/", (req, res) => {
  res.send("hello World");
});

app.listen(PORT, () => {
  console.log("Listening on port 8080");
});
