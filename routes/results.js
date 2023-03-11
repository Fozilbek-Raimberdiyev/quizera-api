const checkAuth = require("../middleware/auth");
const mongoose = require("mongoose");
const router = require("express").Router();

const resultSchema = new mongoose.Schema({
  testerId: String,
  testerImagePath: String,
  workingTime: Date,
  status: String,
  workingDurationTime: Number,
  comments: [Object],
  fullName: String,
  subjectId: String,
  subjectAuthorId: String,
  subjectName: String,
  subjectPoint: Number,
  subjectQuizTime: Number,
  questionsCount: Number,
  countCorrectAnswers: Number,
  countIncorrectAnswers: Number,
  correctAnswers: [Object],
  incorrectAnswers: [Object],
  notSelectedAnswers: [Object],
  ball: Number,
  percentageResult: Number,
  countNotSelectedAnswers: Number,
});

const Result = mongoose.model("results", resultSchema);

//get list results
router.get("/", checkAuth, async (req, res) => {
  let pageNumber = req.query.page || 1;
  let pageLimit = req.query.limit || 10;
  let query = req.query.query;
  let userID = req.user.userID;
  if (query === "me") {
    try {
      Result.find({ testerId: userID })
        .skip((pageNumber - 1) * pageLimit)
        .limit(pageLimit)
        .exec((err, results) => {
          if (!err) {
            Result.countDocuments({testerId : userID}, (err,count) => {
              return res.status(200).send({ results, total : count});
            })
            
          }
        });
    } catch (e) {
      console.log(e)
    }
    finally{
      return 
    }
  }
  if (query === "mySubjects") {
    try {
      Result.find({ subjectAuthorId: userID })
        .skip((pageNumber - 1) * pageLimit)
        .limit(pageLimit)
        .exec((err, results) => {
          if (!err) {
            return res.status(200).send({ results, total: results.length });
          }
        });
    } catch (e) {
      return res.send({message : e.message})
    }
    finally {
      return
    }
  }
  if (query === "all") {
    try {
      Result.find()
        .skip((pageNumber - 1) * pageLimit)
        .limit(pageLimit)
        .exec((err, results) => {
          if (!err) {
            Result.countDocuments((e, count) => {
              return res.status(200).send({ results, total: count });
            })
          }
        });
    } catch (e) {
      return res.send({message : e.message})
    }
    finally {
      return
    }
  }
  return res.status(400).send({ message: "Xatolik yuz berdi!" });
});

module.exports = { resultController: router, Result };
