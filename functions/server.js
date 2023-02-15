// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const dotenv = require("dotenv")
// const morgan = require("morgan");
// const serverless = require('serverless-http');

// //setting node environment variables

// if(process.env.NODE_ENV==="production") {
//   dotenv.config({path : ".env.production  "})
// } else {
//   dotenv.config({path : ".env"})
// }

// //connecting to database
// mongoose.set("strictQuery", false);
// mongoose
//   .connect(process.env.DB_HOST, {})
//   .then(() => {
//     console.log("MongoDB ga ulanish muvaffaqqiyatli amalga oshirildi");
//   })
//   .catch((er) => {
//     console.log("MongoDB ga ulanishda xato ro'y berdi", er);
//   });

// //declaring app
// const app = express();

// //initial route
// app.use("/api", require("../routes/index"));

// // parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use(express.json())
// // parse application/json
// app.use(bodyParser.json());

// //using morgan logger
// // app.use(morgan("tiny"));

// //listening port
// // app.listen("https://fozilbek-quiz.netlify.app", () => {
// //   console.log("Server is listening in ", "https://fozilbek-quiz.netlify.app");
// // });

// module.exports.handler = serverless(app)


const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();

let records = [];

//Get all students
router.get('/', (req, res) => {
  res.send('App is running..');
});

//Create new record
router.post('/add', (req, res) => {
  res.send('New record added.');
});

//delete existing record
router.delete('/', (req, res) => {
  res.send('Deleted existing record');
});

//updating existing record
router.put('/', (req, res) => {
  res.send('Updating existing record');
});

//showing demo records
router.get('/demo', (req, res) => {
  res.json([
    {
      id: '001',
      name: 'Smith',
      email: 'smith@gmail.com',
    },
    {
      id: '002',
      name: 'Sam',
      email: 'sam@gmail.com',
    },
    {
      id: '003',
      name: 'lily',
      email: 'lily@gmail.com',
    },
  ]);
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
