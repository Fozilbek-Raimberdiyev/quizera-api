const checkAuth = require("../middleware/auth")
const mongoose = require("mongoose")
const router = require("express").Router()

const resultSchema = new mongoose.Schema({
    testerId : String,
    workingTime : Date,
    status : String,
    workingDurationTime : Number,
    comments : [Object],
    fullName : String,
    subjectId : String,
    subjectName : String,
    subjectPoint : Number,
    subjectQuizTime : Number,
    questionsCount : Number,
    countCorrectAnswers : Number,
    countIncorrectAnswers : Number,
    correctAnswers : [Object],
    incorrectAnswers : [Object],
    notSelectedAnswers : [Object],
    ball : Number,
    percentageResult : Number,
    countNotSelectedAnswers : Number
})

const Result =  mongoose.model("results",resultSchema);


//get list results
router.get("/", checkAuth, async(req, res) => {
    let query = req.query.query;
    let userID = req.user.userID
    if(query==='me') {
        try {
            let results = await Result.find({testerId : userID})
            let total = await Result.find({testerId : userID}).countDocuments()
            return res.status(200).send({results, total})
        }catch(e) {

        }
    }
    if(query==='all') {
        try {
        let results = await Result.find()
        let total = await Result.find().countDocuments();
        return res.status(200).send({results, total})
        } catch(e) {

        }
    }
    return res.status(400).send({message : "Xatolik yuz berdi!"})
})


module.exports = {resultController :  router, Result}