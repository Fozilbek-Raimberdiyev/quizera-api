const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
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
app.use("/api", require("./routes/index"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//using morgan logger
app.use(morgan("tiny"));

//listening port
app.listen(8080, () => {
  console.log("Server is listening in ", process.env.PORT);
});
