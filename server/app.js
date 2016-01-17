// Copyright (c) 2015, 2016 Alvin Pivowar

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var http = require("http");
var lessMiddleware = require("less-middleware");
var logger = require("morgan");
var path = require("path");

var app = express();
app.server = http.createServer(app);
var io = require("socket.io")(app.server);

var index = require("./routes/index");
var userApi = require("./routes/userApi")(io);

// View engine setup
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../public")));

//Router setup
app.use("/", index);
app.use("/api", userApi);

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