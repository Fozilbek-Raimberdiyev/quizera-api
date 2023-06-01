const router = require("express").Router();
const bodyParser = require("body-parser");
const Joi = require("joi");
const mongoose = require("mongoose");
const multer = require("multer");
const upload = multer({});
const compression = require("compression");

//define schema
const lateTimePraySchema = new mongoose.Schema({
  authorId: String,
  authorFullName: String,
  events: [Object],
  //   isPrayed: Boolean,
  //   start: String,
  //   end: String,
  //   title: String,
  //   content: String,
  //   name: String,
  //   id : Number
});

//define validation
const lateTimePrayValid = Joi.object({
  authorId: Joi.string(),
  authorFullName: Joi.string(),
  events: Joi.array().required(),
  //   isPrayed: Joi.boolean(),
  //   start: Joi.string().required(),
  //   end: Joi.string().required(),
  //   title: Joi.string().required(),
  //   content: Joi.string().required(),
  //   name: Joi.string().required(),
  //   id: Joi.number().required(),
});

//define model
const LateTimePray = mongoose.model("latetimespray", lateTimePraySchema);

//get list events
router.get("/", async (req, res) => {
  let events = await LateTimePray.find();
  return res.status(200).send({ message: "message", events });
});
// router.use(compression);
//add maked events
router.post("/add", async (req, res) => {
  const { error, value } = lateTimePrayValid.validate(req.body);
  if (error) return res.status(400).send({ message: "Bad request" });
  let body = await LateTimePray.insertMany(value);

  // const newPersonEvents = new LateTimePray(value);
  // const savedEvents = await newPersonEvents.save();
  return res.status(201).send({message : "Muvaffaqqiyatli qo'shildi"})
});

// router.post('/addEvents', (req, res) => {
//   const bb = new busboy({ headers: req.headers });
//   const fields = {};
//   bb.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
//     // Handle field data as stream
//     if (!fields[fieldname]) {
//       fields[fieldname] = [];
//     }
//     fields[fieldname].push(val);
//   });
//   bb.on('file', (fieldname, file, filename) => {
//     // Handle file data as stream
//   });
//   bb.on('finish', () => {
//     // Request stream ended
//     res.json({ fields });x
//   });
//   req.pipe(bb);
// });

module.exports = router;
