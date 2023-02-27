const {Router} = require("express")
const {questionController,Question} = require("./questions")
const {subjectController, Subject} = require("./subject")
const {resultController} = require("./results")

const router = Router()
router.use(require("body-parser").json())
router.use(require("cors")({
    origin : "*"
}))
router.get("/", async(req,res) => {
    res.status(200).send({message : "Assalomu alaykum!"})
})
router.use("/todos", require("./todos"))
router.use("/auth", require("./signInAndSignup"))
router.use("/permissions", require("./permissions"))
router.use("/subjects", subjectController)
router.use("/questions", questionController)
router.use("/users", require('./users').router)
router.use("/results", resultController)
module.exports = router