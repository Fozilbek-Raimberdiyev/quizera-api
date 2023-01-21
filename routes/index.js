const {Router} = require("express")


const router = Router()
router.use(require("body-parser").json())
router.use(require("cors")({
    origin : "*"
}))

router.use("/todos", require("./todos"))
router.use("/login", require("./signInAndSignup"))
module.exports = router