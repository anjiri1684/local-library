const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const catalogRouter = require("./routes/catalog"); 

const compression = require("compression");
const helmet = require("helmet");

const app = express();

const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 10 * 1000, 
  max: 10,
});
app.use(limiter);

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const dev_db_url =
  "mmongodb+srv://vincentanjiri12:38836510@cluster0.ypw3sip.mongodb.net/?retryWrites=true&w=majority";
const mongoDB = process.env.MONGODB_URI || dev_db_url;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}



app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);

app.use(compression()); 

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/catalog", catalogRouter); 
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
