const router = require("express").Router();
const mongoose = require("mongoose");
const Joi = require("joi");
const checkAuth = require("../middleware/auth");
const e = require("express");
const { query } = require("express");
const { json } = require("body-parser");
const { User } = require("./users");
const { Result } = require("./results");
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
  if (Object.keys(req.body).length === 0 && limit === "0" && page === "0") {
    try {
      let questions = await Question.find({ subjectId: subjectId });
      return res.status(200).send(questions);
    } catch (e) {
      return res.status(400).send({ message: e });
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
  // subject.isDifferent = subject?.isDifferent === "true" ? true : false;
  if (!subject.isDifferent) {
    let questionsLimit = [];
    let temp = [...result].reverse();
    if (req.query?.forReference) {
      return res.status(200).send({ total, questions: result });
    }
    for (let i = 0; i < subject.quizCount; i++) {
      questionsLimit.push(questions[i]);
    }
    return res.status(200).send({ total, questions: questionsLimit });
  } else {
    if (subject?.quizCount > questions.length) {
      return res.status(200).send(questions);
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
    return res.status(200).send({ questions: newQuestions });
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
  return res.status(201).send({savedQuestion, message : "Savol muvaffaqqiyatli qo'shildi"});
});

//mark tests
router.post("/check", checkAuth, async (req, res) => {
  const user = await User.findById(req.user.userID);
  let answers = req.body.questions;
  let point = req.body.point;
  let temp = [];
  answers.forEach((answer) => {
    if (answer.options && answer.question) {
      temp.push(answer);
    }
  });
  if (temp.length != answers.length) {
    // return res.status(400).send({ message: "Ba'zi savollar yo'q bo'lganligi uchun tekshirilmadi!" });
    answers = temp;
  }
  for (const answer of answers) {
    let largestLastSelectNumber = -Infinity;
    let largestOptionIndex = 0;
    for (let i = 0; i < answer?.options?.length; i++) {
      let option = answer.options[i];
      option.lastSelectNumber = option.lastSelectNumber || 1;
      if (option?.lastSelectNumber > largestLastSelectNumber) {
        largestLastSelectNumber = option.lastSelectNumber;
        largestOptionIndex = i;
      }
    }

    answer.isChecked
      ? (answer.options[largestOptionIndex]["isSelected"] = true)
      : (answer.options[largestOptionIndex]["isSelected"] = false);
  }
  answers.forEach((answer) => {
    answer.options.forEach((option) => {
      if (option.isSelected && option.isTrue) {
        return (answer["isCorrectSelected"] = true);
      }
    });
  });
  let isPassed = false;
  if (summBall(answers) >= (point * 60) / 100) isPassed = true;
  if (!point) {
    let resultTest = {
      testerId : user.userID,
      testerImagePath : req.user.pathImage,
      status : sumCorrectAnswers(answers) >= req.body.subject.quizCount * 60 /100  ? 'Passed' : "Failed",
      workingDurationTime : req.body.workingDurationTime,
      fullName : user.firstName + " " + user.lastName,
      subjectId : req.body.subject?._id,
      subjectName : req.body.subject?.name,
      workingTime : new Date().getTime(),
      subjectQuizTime : req.body.subject.time,
      countCorrectAnswers : sumCorrectAnswers(answers),
      countIncorrectAnswers : sumIncorrectAnswers(answers),
      countNotSelectedAnswers : req.body.subject.quizCount - sumCorrectAnswers(answers) - sumIncorrectAnswers(answers),
      correctAnswers : answers.filter(answer => answer.isCorrectSelected),
      incorrectAnswers : answers.filter(answer => !answer.isCorrectSelected && answer.isChecked),
      ball : summBall(answers),
      questionsCount :  req.body.subject.quizCount,
      notSelectedAnswers : answers.filter(answer => !answer.isChecked),
        percentageResult :  (100 * sumCorrectAnswers(answers) )/ req.body.subject.quizCount,

    }
    let result = await  Result(resultTest);
    let savedResult = await result.save()

    return res.status(200).send({
      answers,
      correctAnswersCount: sumCorrectAnswers(answers),
      inCorrectAnswersCount: sumIncorrectAnswers(answers),
      notCheckedQuestionsCount: sumNotCheckedQuestions(answers),
    });
  } else {
    let resultTest = {
      subjectPoint: point,
      subjectAuthorId : req.body.subject.authorId,
      testerId: req.user.userID,
      testerImagePath : user.pathImage,
      status: isPassed ? "Passed" : "Failed",
      workingDurationTime: req.body.workingDurationTime,
      fullName: user.firstName + " " + user.lastName,
      subjectId: req.body.subject?._id,
      subjectName: req.body.subject?.name,
      subjectPoint: req.body.subject.point,
      workingTime: new Date().getTime(),
      subjectQuizTime: req.body.subject.time,
      countCorrectAnswers: sumCorrectAnswers(answers),
      countIncorrectAnswers: sumIncorrectAnswers(answers),
      countNotSelectedAnswers:
        req.body.subject.quizCount -
        sumCorrectAnswers(answers) -
        sumIncorrectAnswers(answers),
      correctAnswers: answers.filter((answer) => answer.isCorrectSelected),
      incorrectAnswers: answers.filter(
        (answer) => !answer.isCorrectSelected && answer.isChecked
      ),
      ball: summBall(answers),
      percentageResult: (100 * summBall(answers)) / point,
      questionsCount: req.body.subject.quizCount,
      notSelectedAnswers: answers.filter((answer) => !answer.isChecked),
    };
    let result = await Result(resultTest);
    let savedResult = await result.save();
    return res
      .status(200)
      .send({ answers, sum: summBall(answers), isPassed, point });
  }
});

router.get("/:id", async (req, res) => {
  let id = req.params.id;
  if (id === "undefined" || id === "null")
    return res.status(400).send({ message: "Savol identifikatori topilmadi!" });
  let question = await Question.findById(id);
  if (!question) return res.status(404).send({ message: "Savol topilmadi!" });
  return res.status(200).send({ question });
});

//update question
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

//delete question
router.delete("/delete", async (req, res) => {
  Question.findByIdAndRemove(req.query.ID, (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting question" });
    }
    if (!data) {
      return res.status(404).json({ message: "Question not found" });
    }
    return res.json({ message: "Question succesfully deleted" });
  });
});

module.exports = {
  questionController: router,
  Question,
};
