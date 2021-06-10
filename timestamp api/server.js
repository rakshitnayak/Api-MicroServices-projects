// server.js
// where your node app starts

// init project
var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
const { response } = require("express");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/", function (req, res) {
  let utcString = new Date().toUTCString();
  let unixTime = Date.now();
  res.json({ unix: unixTime, utc: utcString });
});

app.get("/api/:date", function (req, res) {
  let year = 0,
    month = 0,
    day = 0;
  if (req.params.date) {
    const splitDate = req.params.date.split("-");
    year = splitDate[0] || 0;
    month = splitDate[1] - 1 || 0;
    day = splitDate[2] || 0;
  }
  if (req.params.date.split(" ").length === 3)
    req.params.date = Date.parse(req.params.date);
  let utcString = new Date(Date.UTC(year, month, day, 0, 0, 0)).toUTCString();
  let unixTime = new Date(req.params.date).getTime();
  if (new Date(Number(req.params.date)).toUTCString() !== "Invalid Date") {
    utcString = new Date(Number(req.params.date)).toUTCString();
    unixTime = Number(req.params.date);
  }
  if (utcString && utcString !== "Invalid Date")
    res.json({ unix: unixTime, utc: utcString });
  else res.json({ error: utcString });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("server started on Port 3000");
});
