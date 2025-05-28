const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./routes");
const fs = require("fs");
// const mime = require("mime");
const morgan = require("morgan")
//setting node environment variables
dotenv.config()



//connecting to database
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DB_HOST, {})
  .then(() => {
    console.log("MongoDB ga ulanish muvaffaqqiyatli amalga oshirildi", 'address :' +  process.env.DB_HOST)
  })
  .catch((er) => {
    console.log("MongoDB ga ulanishda xato ro'y berdi", er);
  });

//declaring app
const app = express();

//setup websocket
const server = require("http").Server(app)
//configuring static files
app.use(express.static("public"));

// Increase maximum payload size to 10mb
app.use(bodyParser.json({ limit: "6mb" }));
app.use(bodyParser.urlencoded({ limit: "6mb", extended: true }));

//using cors
app.use(
  cors({
    origin: "*", // replace with the actual origin of your Vue.js app
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// app.use(compression)

app.get("/", (req, res) => {
  res.send({ message: "Assalomu alaykum!" });
});


//initial route
app.use("/api", router);



//using morgan logger
app.use(morgan("tiny"));

// listening port
server.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening in ", process.env.PORT, 'mode : ',process.env.NODE_ENV );
});
