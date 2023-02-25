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
  authorFullName: Joi.string(),
  createdDate: Joi.number(),
  isForAll: Joi.boolean(),
  isStarted: Joi.boolean().required(),
});

const Subject = mongoose.model("subjects", subjectSchema);

//defining routes
//getting all subject list
router.get("/", checkAuth, async (req, res) => {
  let userID = req.user.userID;
  let user = await User.findById(userID);
  let isForReference = null;
  if(req.query.isForReference==="true") {
    isForReference = true
  } else if(req.query.isForReference==="false") {
    isForReference = false
  }
  let { limit, page } = req.query;
  // let subjectsforAdmin = await Subject.find()
  //   .skip((page - 1) * limit)
  //   .limit(limit);
  if (user.role === "admin") {
    let subjects = await Subject.find()
    let total = await Subject.countDocuments();
    return res.status(200).send({ subjects, total });
  } else if (user.role === "teacher") {
    let allSubjects = await Subject.find();
    let subjects = [];
    for (let key of allSubjects) {
      if(!isForReference) {
        if (
          (key.authorId === userID ||
            key.members.some((member) => member.value === user.email) ||
            key.isForAll) &&
          (key.isStarted  || isForReference)
        ) {
          subjects.push(key);
        }
      } else {
        if (
          (key.authorId === userID ||
            key.members.some((member) => member.value === user.email))
        ) {
          subjects.push(key);
        }
      }
    } 
    let total = subjects.length;
    return res.status(200).send({ subjects, total });
  } else if (user.role === "student") {
    let allSubjects = await Subject.find();
    let subjects = [];
    for (let subject of allSubjects) {
      if (
        (subject.members.some((member) => member.value === user.email) ||
          subject.isForAll) &&
        subject.isStarted
      ) {
        subjects.push(subject);
      }
    }
    let total = subjects.length;
    return res.status(200).send({ subjects, total });
  }
});

//add subject route
router.post("/add", checkAuth, async (req, res) => {
  const { error, value } = subjectValSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const user = await User.findById(req.user.userID);
  req.body["authorFullName"] = user.firstName + " " + user.lastName;
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

//update status subject
router.put("/statusUpdate", checkAuth, async (req, res) => {
  const { status, subjectID } = req.body;
  const updated = await Subject.updateOne(
    { _id: subjectID },
    { $set: { isStarted: status } }
  );
  const subjects = await Subject.find({authorId : req.user.userID})
  return res.status(200).send({message : "Muvaffaqqiyatli", updated, subjects});
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

module.exports = { subjectController: router, Subject };
