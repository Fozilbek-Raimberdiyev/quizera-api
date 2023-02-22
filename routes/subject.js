const router = require("express").Router();
const mongoose = require("mongoose");
const checkAuth = require("../middleware/auth");
const Joi = require("joi");
const { User } = require("./users");
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
  members: [Object],
  authorId: String,
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
});

const Subject = mongoose.model("subjects", subjectSchema);

//defining routes
//getting all subject list
router.get("/", checkAuth, async (req, res) => {
  let userID = req.user.userID;
  let user = await User.findById(userID);
  let { limit, page } = req.query;
  let subjectsforAdmin = await Subject.find()
    .skip((page - 1) * limit)
    .limit(limit);
  let totalForAdmin = await Subject.countDocuments();
  if (user.role === "admin") {
    return res
      .status(200)
      .send({ subjects: subjectsforAdmin, total: totalForAdmin });
  }
  let allSubjects = await Subject.find();
  let forAllSubjects = [];
  let spesicSubjects = [];
  if (user.role === "teacher") {
    let subjectsforTeacher = [];
    for (let subject of allSubjects) {
      if (
        subject.authorId === userID ||
        subject.members.some((member) => member.label === user.email)
      ) {
        subjectsforTeacher.push(subject);
      }
    }
    if (page === 1) {
      page = 0;
    }
    let subjectsforTeacherForPag = subjectsforTeacher.slice(
      page - 1 * limit,
      limit * page
    );
    const total = subjectsforTeacher.length;
    return res.status(200).send({ subjects: subjectsforTeacherForPag, total });
  }
  for (let element of allSubjects) {
    if (element.members.length === 0) {
      forAllSubjects.push(element);
    } else if (element.members.some((member) => member.label === user.email)) {
      spesicSubjects.push(element);
    }
  }
  // let allowSubjects = subjects.filter(subject => {
  //   if(subject?.members.some(m => m.label === user.email)) {
  //     return subject
  //   }
  // })
  let subjects = forAllSubjects.concat(spesicSubjects);
  subjects = subjects.slice(page - 1 * limit, limit * page);
  const total = subjects.length;
  return res.status(200).send({ subjects, total });
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

[
  // {
  //   name: "John",
  //   job: "Developer",
  //   stacks: ["js", "nodejs"],
  // },
  // {
  //   name : "Doe",
  //   job : "Developer",
  //   stacks : ["java", "c++"]
  // },
  // {
  //   name : "Anvar",
  //   job : "Developer",
  //   stacks : ["c#"]
  // }
];
