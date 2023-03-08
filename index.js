const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const router = require("./routes");
const compression = require("compression");
const fs = require("fs")
const mime = require("mime")
//setting node environment variables


// Set up MIME types
mime.define({
  'text/css': ['css'],
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'application/pdf': ['pdf'],
}, {force : true});

//for developing
// dotenv.config({path : ".env"})


//for production and need to be this uncomment while deploying to production
dotenv.config({ path: ".env.production" });

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


//configuring static files
app.use(express.static("public"))

// Increase maximum payload size to 10mb
app.use(bodyParser.json({ limit: "6mb" }));
app.use(bodyParser.urlencoded({ limit: "6mb", extended: true }));

//using cors
app.use(
  cors({
    origin: [
      "https://fozilbek.netlify.app",
      "http://localhost:8080",
      "http://localhost:5173",
    ], // replace with the actual origin of your Vue.js app
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// app.use(compression)

app.get("/", (req, res) => {
  res.send({ message: "Assalomu alaykum!" });
});

app.get("/public/uploads/:filename", (req, res) => {
  let fileName = req.params.filename;
  let file = fs.readFile(`${__dirname}/public/uploads/${fileName}`, 'utf-8', function (err, data) {
    if (err) {
      console.error(err);
      return;
    }
    res.type(["png", "jpg", "jpeg"]);
    return res.sendFile(`${__dirname}/public/uploads/${fileName}`)
    // return res.send(data)
    // Do something with the file data
  });
  // return res.send(file);
  // console.log(file)
});

//initial route
app.use("/api", router);

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true, limit : "50mb" }));
// app.use(bodyParser.json({limit : "50mb"}))

// app.use(express.json());
// parse application/jsonapp.use(bodyParser.json());

//using morgan logger
// app.use(morgan("tiny"));

// listening port
app.listen(3000, () => {
  console.log("Server is listening in ", 3000);
});
