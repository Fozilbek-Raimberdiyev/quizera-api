const {Router} = require("express")
const router =  Router();
const Permission = require("../models/permissionModel")
const authCheck = require("../middleware/auth")


//get permissions list
router.get("/", authCheck, async(req, res) => {
    let permissions = await Permission.find();
    res.status(200).json({permissions})
})


router.post("/add", authCheck,async(req, res) => {
    let rules = req.body;
    if(!rules) return res.status(400).json({message : "Bad request"});
    let newPermission = new Permission(rules)
    let savedPermission = await newPermission.save();
    res.status(201).json({message : "Succesfully added"})
})

module.exports  = router