const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv")
const morgan = require("morgan");
const router = require("./routes")

//setting node environment variables

// if(process.env.NODE_ENV==="production") {
//   dotenv.config({path : ".env.production  "})
// } else {
//   dotenv.config({path : ".env"})
// }
dotenv.config({path : ".env.production"})

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

//using cors
app.use(cors({
  origin: 'https://fozilbek.netlify.app', // replace with the actual origin of your Vue.js app
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.get("/", (req,res) => {
  res.send({message : "Assalomu alaykum!"})
})

//initial route
app.use("/api", router);


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json())
// parse application/json
app.use(bodyParser.json());

//using morgan logger
// app.use(morgan("tiny"));

// listening port
app.listen(3000, () => {
  console.log("Server is listening in ",3000);
});
