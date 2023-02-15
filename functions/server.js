const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv")
const morgan = require("morgan");
const serverless = require('serverless-http');

//setting node environment variables

if(process.env.NODE_ENV==="production") {
  dotenv.config({path : ".env.production  "})
} else {
  dotenv.config({path : ".env"})
}

//connecting to database
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DB_HOST, {})
  .then(() => {
    console.log("MongoDB ga ulanish muvaffaqqiyatli amalga oshirildi");
  })
  .catch((er) => {
    console.log("MongoDB ga ulanishda xato ro'y berdi", er);
  });

//declaring app
const app = express();

//initial route
app.use("/api", require("../routes/index"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json())
// parse application/json
app.use(bodyParser.json());

//using morgan logger
// app.use(morgan("tiny"));

//listening port
// app.listen("https://fozilbek-quiz.netlify.app", () => {
//   console.log("Server is listening in ", "https://fozilbek-quiz.netlify.app");
// });

module.exports.handler = serverless(app)
