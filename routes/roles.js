const router = require("express").Router();
const checkAuth = require("../middleware/auth")
const mongoose = require("mongoose")
const Joi = require("joi");
const { string } = require("joi");

//defining scheme roles
let roleScheme = mongoose.Schema({
    name : {
        type :String,
        unique : true
    },
    timestamp : {
        type :String || Number,
        default : new Date().getTime()
    }
})


//validating scheme
const roleValidScheme = Joi.object({
    name : Joi.string().min(4).required(),
    timestamp : Joi.number()
})

//setting Role constructor
const Role = mongoose.model("roles",roleScheme)

//all roles
router.get("/",checkAuth,() => {

})


//add role
router.post("/add", checkAuth,async (req,res) => {
    let {error,value} = roleScheme.validate(req.body);
    if (error) {
        return res.status(400).json({
          message: error.details[0].message,
        });
      }
      let {name} = req.body;
      let existedRole = await Role.findOne({name})
      if(existedRole) res.status(400).send({message : "Bu role oldin ro'yxatdan o'tkazilgan!"})
      let role =  new Role(value);
      res.status(201).send({message : "Role muvaffaqqiyatli yaratildi"})
})




module.exports = router