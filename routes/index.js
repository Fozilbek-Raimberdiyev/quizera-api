const {Router} = require("express")
const {questionController,Question} = require("./questions")
const {subjectController, Subject} = require("./subject")

const router = Router()
router.use(require("body-parser").json())
router.use(require("cors")({
    origin : "*"
}))

router.use("/todos", require("./todos"))
router.use("/auth", require("./signInAndSignup"))
router.use("/permissions", require("./permissions"))
router.use("/subjects", subjectController)
router.use("/questions", questionController)
module.exports = router