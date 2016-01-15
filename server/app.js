var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var http = require("http");
var logger = require("morgan");
var path = require("path");

var app = express();
app.server = http.createServer(app);

var io = require("socket.io")(app.server);
//io.on("connection", function (socket) {
//  socket.emit("this", "You are connected");
//});

var index = require("./routes/index");
var api = require("./routes/api")(io);

// View engine setup
console.log(__dirname);
console.log(path.join(__dirname, "./views"));
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require("less-middleware")(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../public")));

//Router setup
app.use("/", index);
app.use("/api",api);

// Handle 404
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Generic error handler

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {}
  });
});

module.exports = app;