const router = require("express").Router();
const mongoose = require("mongoose");
const Joi = require("joi");
const checkAuth = require("../middleware/auth");
const e = require("express");
const { query } = require("express");
const { json } = require("body-parser");
let timeStamp = new Date().getTime();
router.use(json(query));
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    // Generate random number
    var j = Math.floor(Math.random() * (i + 1));

    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

function generateQuestion(list, ball) {
  let newQuestion = {};
  for (element of list) {
    if (element.ball === ball && !element.isHas) {
      newQuestion = element;
      element.isHas = true;
      return newQuestion;
    }
  }
  return newQuestion;
}

function summBall(list) {
  let sum = 0;
  for (let element of list) {
    if (element.isChecked) {
      for (let el of element.options) {
        if (el.isSelected && el.isTrue) {
          sum = sum + element.ball;
        }
      }
    }
  }
  return sum;
}

function sumCorrectAnswers(list) {
  let sum = 0;
  for (let key of list) {
    key.isCorrectSelected === "true" ? true : false;
    // console.log(key.isCorrectSelected, typeof key.isCorrectSelected)
    if (key?.isCorrectSelected && key.isChecked) {
      sum++;
    }
  }
  return sum;
}

function sumIncorrectAnswers(list) {
  let sum = 0;
  for (let key of list) {
    if (!key.hasOwnProperty("isCorrectSelected") && key.isChecked) {
      sum++;
    }
  }
  return sum;
}

function sumNotCheckedQuestions(list) {
  let sum = 0;
  for (let key of list) {
    key.isChecked === "true" ? true : false;
    if (!key.isChecked) {
      sum++;
    }
  }
  return sum;
}

const questionSchema = new mongoose.Schema({
  question: String,
  ball: Number,
  isHas: Boolean,
  options: [Object],
  subjectId: String,
  isChecked: {
    type: Boolean,
    default: false,
  },
  timeStamp: {
    type: String,
    default: timeStamp,
  },
});

const questionValSchema = Joi.object().keys({
  options: Joi.array().items(
    Joi.object({
      optionLabel: Joi.required(),
      isTrue: Joi.boolean().required(),
      placeholder: Joi.any(),
      lastSelectNumber: Joi.number(),
      isSelected: Joi.boolean(),
    })
  ),
  question: Joi.any().required(),
  ball: Joi.number(),
  isHas: Joi.boolean().required(),
  subjectId: Joi.any().required(),
});

const Question = mongoose.model("questions", questionSchema);

//defining routes

//get all questions
router.post("/", async (req, res) => {
  let { subjectId, limit, page } = req.query;
  let subject = req.body;
  if(Object.keys(req.body).length===0 && limit==="0" && page==="0") {
    try{
      let questions = await Question.find({subjectId : subjectId});
    return res.status(200).send(questions);
    } catch(e) {
      res.status(400).send({message : e})
    }
  }
  if (subject?.grades) {
    subject.grades.sort((a, b) => +a.grade - +b.grade);
  }

  let newQuestions = [];
  const result = await Question.find({ subjectId: subjectId })
    .skip(((page || 1) - 1) * (limit || 5))
    .limit(limit);
  let questions = shuffleArray(result);
  questions.forEach((question) => shuffleArray(question.options));
  let total = await Question.find({ subjectId: subjectId }).countDocuments();
  subject.isDifferent = subject?.isDifferent === "true" ? true : false;
  if (!subject?.isDifferent) {
    let temp = [...result].reverse();
    if (req.query?.forReference) {
      return res.status(200).send({ total, questions: temp });
    }
    res.status(200).send({ total, questions });
  } else {
    if(subject?.quizCount > questions.length) {
      return res.status(200).send(questions)
    }
    function generateNewMass(mass) {
      let newMass = [];
      let index = 0;
      mass.forEach((element) => {
        for (let i = 0; i < +element.count; i++) {
          newMass[index + i] = generateQuestion(questions, +element.grade);
        }
        index += +element.count;
      });
      return newMass;
    }
    newQuestions = generateNewMass(subject.grades);
    res.status(200).send({ questions: newQuestions });
  }
});

//add question
router.post("/add", checkAuth, async (req, res) => {
  req.body.ball = req.body.ball || 0;
  let { error, value } = questionValSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const newQuestion = new Question(value);
  const savedQuestion = await newQuestion.save();
  res.status(201).send(savedQuestion);
});

//mark tests
router.post("/check", checkAuth, async (req, res) => {
  let answers = req.body.questions;
  let point = req.body.point;
  answers.forEach((answer) => {
    if (!answer?.options) {
      res.status(400).send({ message: "Savollar aniqlanmadi" });
    }
  });
  for (const answer of answers) {
    let largestLastSelectNumber = -Infinity;
    let largestOptionIndex = -1;
    for (let i = 0; i < answer?.options.length; i++) {
      let option = answer.options[i];
      option.lastSelectNumber = option.lastSelectNumber || 0;
      if (option?.lastSelectNumber > largestLastSelectNumber) {
        largestLastSelectNumber = option.lastSelectNumber;
        largestOptionIndex = i;
      }
    }
    answer.options[largestOptionIndex]["isSelected"] = true;
  }
  answers.forEach((answer) => {
    answer.options.forEach((option) => {
      if (option.isSelected && option.isTrue)
        return (answer["isCorrectSelected"] = true);
    });
  });
  let isPassed = false;
  if (summBall(answers) >= (point * 60) / 100) isPassed = true;
  if (!point) {
    res.status(200).send({
      answers,
      correctAnswersCount: sumCorrectAnswers(answers),
      inCorrectAnswersCount: sumIncorrectAnswers(answers),
      notCheckedQuestionsCount: sumNotCheckedQuestions(answers),
    });
  } else {
    res.status(200).send({ answers, sum: summBall(answers), isPassed, point });
  }
});

router.get("/:id", async (req, res) => {
  let id = req.params.id;
  if (id === "undefined" || id === "null")
    return res.status(400).send({ message: "Savol identifikatori topilmadi!" });
  let question = await Question.findById(id);
  if (!question) return res.status(404).send({ message: "Savol topilmadi!" });
  res.status(200).send({ question });
});

//delete question
router.put("/update", async (req, res) => {
  let id = req.query.ID;
  let body = req.body;
  Question.findByIdAndUpdate(id, body, { new: true }, (err, data) => {
    if (err) {
      return res.status(500).send({ message: "Savolni topishda xatolik..." });
    }
    if (!data) {
      return res
        .status(404)
        .send({ message: "Bunaqa identifikatorli savol topilmadi..." });
    }
    return res.send({ message: "Savol muvaffaqqiyatli yangilandi..." });
  });
});

module.exports = {
  questionController: router,
  Question,
};
