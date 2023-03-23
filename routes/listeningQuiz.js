const { Router } = require("express");
const router = Router();
const multer = require("multer");
const mongoose = require("mongoose");
const checkAuth = require("../middleware/auth");
const Joi = require("joi");
const SALT_ROUNDS = 10;
const bcryptjs = require("bcryptjs");

//function  check quiz
function checkQuiz(textArray) {
  for(let element of textArray) {
    if(!element.isVisible && element.value.toLocaleLowerCase()===element.label.toLocaleLowerCase()) {
      element["isCorrectFilled"] = true
    } element['isSelected'] = true
  }
  return textArray
}

function getStatistic(textArray) {
  let stat = {
    correctWordsCount : 0,
    inCorrectWordsCount : 0,
    notFilledWords : 0 
  }
for(let element of textArray) {
  if(element.isVisible && element.value.toLocaleLowerCase()===element.label.toLocaleLowerCase()) {
    stat.correctWordsCount++
  } else if(element.isSelected && !element.isVisible && element.value.toLocaleLowerCase()!=element.label.toLocaleLowerCase()) {
    stat.inCorrectWordsCount++
  } else if(!element.isSelected) {
    stat.notFilledWords++
  }
}
return stat
}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'public/uploads/listening/');
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

const ListeningQuiz = mongoose.model("listeningquizzes", listeningQuizSchema);

//get list audio quizzes
router.get("/", checkAuth, async (req, res) => {
  let pageNumber = req.query.page || 1;
  let pageLimit = req.query.limit || 10;
  let isForReference = req.query.isForReference;
  if (isForReference === true) {
    try {
      ListeningQuiz.find({ authorId: req.user.userID })
        .skip((pageNumber - 1) * pageLimit)
        .limit(pageLimit)
        .exec((err, results) => {
          if (!err) {
            return res.status(200).send({
              quizzes: results,
              total: results.length,
            });
          }
        });
    } catch (e) {
      console.log(e);
    }
  } else {
    ListeningQuiz.find({
      $or: [
        {
          members: {
            $elemMatch: {
              value: req.user.email,
            },
          },
          isStarted: true,
        },
        {
          authorId: req.user.userID,
        },
        {
          isForAll : true,
          isStarted : true
        }
      ],
    })
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit)
      .exec(function (err, results) {
        if (!err) {
          return res.status(200).send({
            quizzes: results,
            total: results.length,
          });
        }
      });
  }
});

//add audio
router.post("/add", upload.single("audio"), checkAuth, async (req, res) => {
  const audio = req.file;
  let body = JSON.parse(req.body.form);
  if (audio!=null || audio!=undefined) {
    body["audioPath"] = process.env.HOST + audio.path;
  }
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

//get by id
router.get("/:id", async (req, res) => {
  let id = req.params.id;
  if (id === "undefined" || id === "null")
    return res.status(400).send({ message: "Fan identifikatori topilmadi..." });
  let quiz = await ListeningQuiz.findById(id);
  if (!quiz) {
    return res.status(404).json({ message: "Sinov topilmadi" });
  }
  quiz.password = undefined;
  return res.status(200).send(quiz);
});

//edit subject route
router.put("/update", upload.single("audio"), checkAuth, async (req, res) => {
  let body = JSON.parse(req.body.form);
  let audio = req.file
  if (audio!=null || audio!=undefined) {
    body["audioPath"] = process.env.HOST + audio.path;
  }
  const { error, value } = listeningQuizValSchema.validate(body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  bcryptjs.hash(value.password, SALT_ROUNDS, (err, hashedPassword) => {
    if (err && value.isHasPassword)
      return res.status(400).send({ message: "Parolni saqlashda xatolik!" });
    value.password = hashedPassword;
    ListeningQuiz.findByIdAndUpdate(
      req.query.ID,
      value,
      { new: true },
      (err, data) => {
        if (err) {
          return res.status(500).json({ message: "Error finding quiz" });
        }
        if (!data) {
          return res.status(404).json({ message: "Quiz not found" });
        }
        return res.json({ message: "Quiz succesfully updated" });
      }
    );
  });
});

//update status subject
router.put("/statusUpdate", checkAuth, async (req, res) => {
  const { status, quiz } = req.body;
  const updated = await ListeningQuiz.updateOne(
    { _id: quiz },
    { $set: { isStarted: status } }
  );
  const quizzes = await ListeningQuiz.find({ authorId: req.user.userID });
  return res.status(200).send({ message: "Muvaffaqqiyatli", updated, quizzes });
});

//delete quiz
router.delete("/delete", async (req, res) => {
  let id = req.query.ID;
  try {
    ListeningQuiz.findByIdAndRemove(id, (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Error deleting quiz" });
      }
      if (!data) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      return res.json({
        message: `Quiz deleted.`,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

//check password quiz
router.post("/checkPassword", checkAuth, async (req, res) => {
  const { quizID, password } = req.body;
  const existedQuiz = await ListeningQuiz.findById(quizID);
  let comparedPassword = await bcryptjs.compare(password, existedQuiz.password);
  if (!comparedPassword) {
    return res.status(400).send({ message: "Parol xato kiritildi..." });
  }
  return res.status(200).send({ isAllowed: true });
});


//check quiz results
router.post("/check", checkAuth, async(req, res) => {
  let body = req.body;
let result =   checkQuiz(body);
return res.status(200).send({result, stat : getStatistic(body)})
})

module.exports = router;
