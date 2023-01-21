const { default: mongoose } = require("mongoose");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");
const SALT_ROUNDS = 10;
//user schema defining
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  birdthData: String,
  email: {
    type : String,
    unique : true
  },
  phoneNumber: {
    type : Number,
    unique : true
  },
  role: String,
  permissions: Array,
  password: String,
});

//user validate schema
const userValSchema = Joi.object({
  firstName: Joi.string().min(5).max(30).required(),
  lastName: Joi.string().min(5).max(30).required(),
  birdthData: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.number().required(),
  role: Joi.string(),
  permissions: Joi.string(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

// userSchema.pre("save", async (next) => {
//   const salt = await bcrypt.genSalt();
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, SALT_ROUNDS, function(err, hashedPassword) {
    if (err) return next(err);
    user.password = hashedPassword;
    next();
  });
});


//User model defining
let User = mongoose.model("users", userSchema);

router.get("/users", () => {});

module.exports = {
  User,
  userValSchema,
};
