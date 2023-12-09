const { default: mongoose } = require("mongoose");
const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const checkAuth = require("../middleware/auth");
const SALT_ROUNDS = 10;
//user schema defining
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  birthData: String,
  email: {
    type : String,
    unique : true
  },
  phoneNumber: {
    type : String,
    unique : true
  },
  role: String,
  permissions: Array,
  password: String,
  dataRegister : {
    type : Number,
    default : new Date().getTime()
  },
  pathImage : String
});

//user validate schema
const userValSchema = Joi.object({
  firstName: Joi.string().min(5).max(30).required(),
  lastName: Joi.string().min(5).max(30).required(),
  birthData: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  role: Joi.string().required(),
  permissions: Joi.array(),
  password: Joi.string().min(8).required(),
  dataRegister : Joi.number()
});

// userSchema.pre("save", async (next) => {
//   const salt = await bcryptjs.genSalt();
//   this.password = await bcryptjs.hash(this.password, salt);
//   next();
// });

userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcryptjs.hash(user.password, SALT_ROUNDS, function(err, hashedPassword) {
    if (err) return next(err);
    user.password = hashedPassword;
    next();
  });
});


// DBda qo'lda parol kiritish uchun
// const parol = bcryptjs.hashSync("student", SALT_ROUNDS);
// console.log(parol)

//User model defining
let User = mongoose.model("users", userSchema);

router.get("/", checkAuth, async (req,res) => {
  let users = await User.find().select({password : 0});
  res.send(users)
});

module.exports = {
  User,
  userValSchema,
  router
};
