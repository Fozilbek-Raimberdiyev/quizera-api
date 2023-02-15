const router = require("express").Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/auth");
const Joi = require("joi");
const Question = require("./questions").Question;

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
});

const subjectValSchema = Joi.object({
  name: Joi.string().min(4).max(50).required(),
  time: Joi.number().required(),
  quizCount: Joi.number().required(),
  isDifferent: Joi.boolean().required(),
  grades: Joi.array(),
  point: Joi.number(),
});

const Subject = mongoose.model("subjects", subjectSchema);

//defining routes
//getting all subject list
router.get("/", async (req, res) => {
  let { limit, page } = req.query;
  let subjects = await Subject.find()
    .skip((page - 1) * limit)
    .limit(limit);
  let total = await Subject.countDocuments();
  res.status(200).send({ subjects, total });
});

//add subject route
router.post("/add", checkAuth, async (req, res) => {
  const { error, value } = subjectValSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  let newSubject = await Subject(req.body);
  let savedSubject = await newSubject.save();
  res.status(201).send(savedSubject);
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

  // subject.grades.forEach((grade) => {
  //   var key = grade["hasCount"]
  //   countQuestions(+grade.grade).then((number) => key =  number);
  // });

  for (let i = 0; i < subject.grades.length; i++) {
    const count = await Question.find({
      ball: +subject.grades[i].grade,
    }).countDocuments();
    subject.grades[i].countQuestions = count ? count : 0;
  }
  res.status(200).send(subject);
});

//edit subject route
router.put("/update", checkAuth, async (req, res) => {
  const { error, value } = subjectValSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  Subject.findByIdAndUpdate(
    req.query.ID,
    req.body,
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

// async function getQuestions(limit) {
//   let questions = await Subject.find().skip(0).limit(limit);
//   return questions
// }
// let questions = getQuestions(4)
// console.log(questions.then((res) => {
//   console.log(res)
// }))
module.exports = { subjectController: router, Subject };
