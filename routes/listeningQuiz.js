const { Router } = require("express");
const router = Router();
const multer = require("multer");
const mongoose = require("mongoose");
const checkAuth = require("../middleware/auth");
const Joi = require("joi");
const SALT_ROUNDS = 10;
const bcryptjs = require("bcryptjs");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public/uploads/listening/");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
});

const listeningQuizSchema = new mongoose.Schema({
  name: String,
  time: Number,
  text: String,
  textArray: [Object],
  members: [Object],
  authorId: String,
  authorFullName: String,
  createdDate: {
    type: Number,
    default: new Date().getTime(),
  },
  isForAll: Boolean,
  isStarted: {
    type: Boolean,
    default: false,
  },
  password: String,
  isHasPassword: Boolean,
  authorPathImage: String,
  audioPath: String,
});

const listeningQuizValSchema = Joi.object({
  name: Joi.string().min(4).max(50).required(),
  text: Joi.string().required(),
  textArray: Joi.array().required(),
  time: Joi.number().required(),
  members: Joi.array().required(),
  authorId: Joi.string().required(),
  authorPathImage: Joi.string(),
  authorFullName: Joi.string(),
  createdDate: Joi.number(),
  isForAll: Joi.boolean(),
  isStarted: Joi.boolean().required(),
  password: Joi.string(),
  isHasPassword: Joi.boolean().required(),
  audioPath: Joi.string().required(),
});

//setting hash password subject
listeningQuizSchema.pre("save", function (next) {
  const quiz = this;
  if (!quiz.isModified("password")) return next();

  bcryptjs.hash(quiz.password, SALT_ROUNDS, function (err, hashedPassword) {
    if (err) return next(err);
    quiz.password = hashedPassword;
    next();
  });
});

const ListeningQuiz = mongoose.model("listeningquiz", listeningQuizSchema);

//get list audio quizzes
router.get("/", async (req, res) => {
  let pageNumber = req.query.page || 1;
  let pageLimit = req.query.limit || 10;
  let allQuizzes = await ListeningQuiz.find()
    .skip((pageNumber - 1) * pageLimit)
    .limit(pageLimit);
    let total = await ListeningQuiz.countDocuments()
  res.status(200).send({
    quizzes : allQuizzes,
    total
  });
});  


//add audio
router.post("/add", upload.single("audio"), checkAuth, async (req, res) => {
  const audio = req.file;
  let body = JSON.parse(req.body.form);
  body["audioPath"] = process.env.HOST + audio.path;
  console.log(body);
  const { error, value } = listeningQuizValSchema.validate(body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }
  try {
    let listeningquiz = await ListeningQuiz(value);
    let newQuiz = await listeningquiz.save();
    let all = await ListeningQuiz.find();
    let total = await ListeningQuiz.find().countDocuments();
    return res
      .status(200)
      .send({ message: "Muvaffaqqiyatli", quizs: all, total });
  } catch (e) {}
});

module.exports = router;
