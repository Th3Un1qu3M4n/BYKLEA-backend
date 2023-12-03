var createError = require("http-errors");
const mongoose = require("mongoose");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

var usersRouter = require("./routes/users");
var passwordresetrouter = require("./routes/resetpassword");
var verifyuserrouter = require("./routes/verifyuser");
var adsrouter = require("./routes/ads");
var partsrouter = require("./routes/parts");
var mechanicrouter = require("./routes/mechanics");
const { error } = require("console");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use("/uploads", express.static("uploads"));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3001" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/user", usersRouter);
app.use("/resetpassword", passwordresetrouter);
app.use("/verify", verifyuserrouter);
app.use("/ads", adsrouter);
app.use("/parts", partsrouter);
app.use("/mechanic", mechanicrouter);

const textGeneration = async (prompt) => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: `Human: ${prompt}\nAI: `,
      temperature: 0.5,
      max_tokens: 100,
      top_p: 0.9,
      frequency_penalty: 1,
      presence_penalty: 0.3,
      stop: ["Human:", "AI:"],
    });

    return {
      status: 1,
      response: `${response.data.choices[0].text}`,
    };
  } catch (error) {
    return {
      status: 0,
      response: "",
    };
  }
};

app.post("/dialogflow", async (req, res) => {
  let action = req.body.queryResult.action;
  let queryText = req.body.queryResult.queryText;

  if (action === "input.unknown") {
    let result = await textGeneration(queryText);
    if (result.status == 1) {
      res.send({
        fulfillmentText: result.response,
      });
    } else {
      res.send({
        fulfillmentText: `Sorry, I'm not able to help with that.`,
      });
    }
  } else {
    res.send({
      fulfillmentText: `No handler for the action ${action}.`,
    });
  }
});

mongoose
  .connect("mongodb://127.0.0.1:27017/byklea")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

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
  res.send({ error: err.message });
});
module.exports = app;
