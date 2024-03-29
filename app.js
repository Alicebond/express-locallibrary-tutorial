const createError = require("http-errors");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const catalogRouter = require("./routes/catalog");
const compression = require("compression");
const helmet = require("helmet");

const { username, password } = require("./config");

// Connect to database
mongoose.set("strictQuery", false);
const mongoDB = `mongodb+srv://${username}:${password}@cluster0.frztuxp.mongodb.net/local_library?retryWrites=true&w=majority`;

async function main() {
  await mongoose.connect(mongoDB);
}
main().catch((err) => console.log(err));

const app = express();

const RateLimit = require("express-rate-limit");
const Limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});
app.use(Limiter);

app.use(compression());
app.use(
  helmet.contentSecurityPolicy({
    directive: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/catalog", catalogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
