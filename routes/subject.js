const router = require("express").Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/auth");
const Joi = require("joi");
const { User } = require("./users");
const { Question } = require("./questions");
const SALT_ROUNDS = 10;
const bcryptjs = require("bcryptjs");
const multer = require("multer");

//defining storage for files
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

//countQuestionDefine
async function countQuestions(ball) {
  let count = await Question.find({ ball: ball }).countDocuments();
  return count;
}

const subjectSchema = new mongoose.Schema({
  name: String,
  time: Number,
  quizCount: Number,
  isDifferent: Boolean,
  grades: [Object],
  point: Number,
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

const subjectValSchema = Joi.object({
  name: Joi.string().min(4).max(50).required(),
  time: Joi.number().required(),
  quizCount: Joi.number().required(),
  isDifferent: Joi.boolean().required(),
  grades: Joi.array(),
  point: Joi.number(),
  members: Joi.array().required(),
  authorId: Joi.string().required(),
  authorPathImage: Joi.string(),
  authorFullName: Joi.string(),
  createdDate: Joi.number(),
  isForAll: Joi.boolean(),
  isStarted: Joi.boolean().required(),
  password: Joi.string(),
  isHasPassword: Joi.boolean().required(),
  audioPath: Joi.string(),
});

//setting hash password subject
subjectSchema.pre("save", function (next) {
  const subject = this;
  if (!subject.isModified("password")) return next();

  bcryptjs.hash(subject.password, SALT_ROUNDS, function (err, hashedPassword) {
    if (err) return next(err);
    subject.password = hashedPassword;
    next();
  });
});

const Subject = mongoose.model("subjects", subjectSchema);

//defining routes
//getting all subject list
router.get("/", checkAuth, async (req, res) => {
  // 2ta asosiy shartga qarab. 1. reference uchun 2. reference uchun emas
  //2 ta ichki holatga qarab ro'yhat beriladi. 1. admin roli uchun. 2. boshqa rollar uchun
  let userID = req.user.userID;
  let user = await User.findById(userID);
  let { limit, page } = req.query;
  //1-asosiy shart: ro'yhat ma'lumot ustida ishlash uchun so'ralayotgan bo'lsa
  if (req.query.isForReference === true) {
    if (user.role === "admin") {
      Subject.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .exec((err, results) => {
          if (!err) {
            Subject.countDocuments((err, count) => {
              return res.status(200).send({ subjects: results, total: count });
            });
          }
        });
    } else {
      Subject.find({ authorId: userID })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec((err, results) => {
          if (!err) {
            Subject.countDocuments({ authorId: userID }, (err, count) => {
              return res.status(200).send({ subjects: results, total: count });
            });
          }
        });
    }
  }
  // 2-asosiy shart. ro'yhat test yechish uchun so'ralayotgan bo'lsa
  else {
    if (user.role === "admin") {
      Subject.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .exec((err, results) => {
          if (!err) {
            Subject.countDocuments((err, count) => {
              return res.status(200).send({ subjects: results, total: count });
            });
          }
        });
    } else {
      Subject.find({
        $or: [
          { authorId: userID },
          { isStarted: true, members: { $elemMatch: { value: user.email } } },
        ],
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec((err, results) => {
          if (!err) {
            Subject.countDocuments(
              {
                $or: [
                  { authorId: userID },
                  {
                    isStarted: true,
                    members: { $elemMatch: { value: user.email } },
                  },
                ],
              },
              (err, count) => {
                return res
                  .status(200)
                  .send({ subjects: results, total: count });
              }
            );
          }
        });
    }
  }
});

//add subject route
router.post("/add", upload.single("audio"), checkAuth, async (req, res) => {
  let body = JSON.parse(req.body.form);
  let audio = req.file;

  const { error, value } = subjectValSchema.validate(body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  if (audio != null || audio != undefined) {
    value["audioPath"] = process.env.HOST + audio.path;
  }
  const user = await User.findById(req.user.userID);
  value["authorFullName"] = user.firstName + " " + user.lastName;
  value["authorPathImage"] = user.pathImage;
  let newSubject = await Subject(value);
  let savedSubject = await newSubject.save();
  savedSubject.password = undefined;
  res
    .status(201)
    .send({ savedSubject, message: "Fan muvaffaqqiyatli qo'shildi" });
});

//get by id
router.get("/:id", async (req, res) => {
  let id = req.params.id;
  if (id === "undefined" || id === "null")
    return res.status(400).send({ message: "Fan identifikatori topilmadi..." });
  let subject = await Subject.findById(id);
  if (!subject) {
    return res.status(404).json({ message: "Fan topilmadi" });
  }

  for (let i = 0; i < subject.grades.length; i++) {
    const count = await Question.find({
      ball: +subject.grades[i].grade,
    }).countDocuments();
    subject.grades[i].countQuestions = count ? count : 0;
  }
  subject.password = undefined;
  return res.status(200).send(subject);
});

//edit subject route
router.put("/update", checkAuth, async (req, res) => {
  const { error, value } = subjectValSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  bcryptjs.hash(value.password, SALT_ROUNDS, (err, hashedPassword) => {
    if (err && value.isHasPassword)
      return res.status(400).send({ message: "Parolni saqlashda xatolik!" });
    value.password = hashedPassword;
    Subject.findByIdAndUpdate(
      req.query.ID,
      value,
      { new: true },
      (err, data) => {
        if (err) {
          return res.status(500).json({ message: "Error finding subject" });
        }
        if (!data) {
          return res.status(404).json({ message: "Subject not found" });
        }
        return res.json({ message: "Subject succesfully updated" });
      }
    );
  });
});

//update status subject
router.put("/statusUpdate", checkAuth, async (req, res) => {
  const { status, subjectID } = req.body;
  const updated = await Subject.updateOne(
    { _id: subjectID },
    { $set: { isStarted: status } }
  );
  const subjects = await Subject.find({ authorId: req.user.userID });
  return res
    .status(200)
    .send({ message: "Muvaffaqqiyatli", updated, subjects });
});

//delete subject and subject questions
router.delete("/delete", async (req, res) => {
  let id = req.query.ID;
  try {
    const result = await Question.deleteMany({ subjectId: id });
    Subject.findByIdAndRemove(id, (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error deleting subject" });
      }
      if (!data) {
        return res.status(404).json({ message: "Subject not found" });
      }
      return res.json({
        message: `Subject and ${result.deletedCount} questions deleted.`,
      });
    });
    // res.send(`${result.deletedCount} questions deleted.`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

//check password subject
router.post("/checkPassword", checkAuth, async (req, res) => {
  const { subject, password } = req.body;
  const existedSubject = await Subject.findById(subject._id);
  let comparedPassword = await bcryptjs.compare(
    password,
    existedSubject.password
  );
  if (!comparedPassword) {
    return res.status(400).send({ message: "Parol xato kiritildi..." });
  }
  return res.status(200).send({ isAllowed: true });
});

module.exports = { subjectController: router, Subject };
