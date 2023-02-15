const { Router } = require("express");
const { User, userValSchema } = require("./users");
const bcrypt = require("bcrypt");
const router = Router();
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Ma'lumotlar to'liq kiritilmagan" });
  }
  let existedUser = await User.findOne({ email });
  if (!existedUser) {
   return res.status(400).json({
      message: "Siz kiritgan email bo'yicha ma'lumot topilmadi",
    });
  }
  let comparedPassword = await bcrypt.compare(password, existedUser.password);
  if (!comparedPassword) {
    res.status(400).json({
      message: "Parol xato kiritildi",
    });
  }
  // let jsonSignature = await bcrypt.hash(process.env.JSON_SIGNATURE, 10);
  let payload = {
    userID : existedUser._id,
  }
  const token = jwt.sign(payload, process.env.JSON_SIGNATURE, {expiresIn : 60*60*24});

  //sending user object without password property
  existedUser.password = undefined;

  //sending to client user object and token 
  res.status(200).send({
    user: existedUser,
    token,
  });
});


//register controller
router.post("/register", async (req, res) => {
  const { error, value } = userValSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  let { email, phoneNumber } = req.body;

  let existedUser = await User.findOne({ email, phoneNumber });
  if (existedUser) {
    return res.status(400).json({
      message:
        "Bu email yoki raqam orqali allaqachon tizimdan ro'yhatdan o'tilgan",
    });
  }

  let user = new User(value);
  let savedUser = await user.save();
  let jsonSignature = await bcrypt.hash(process.env.JSON_SIGNATURE, 10);
  const token = jwt.sign({ savedUser }, jsonSignature, { expiresIn: "1h" });
  savedUser = await User.find().select({
    password: 0,
  });
  res.header("x-auth-token", token).status(201).send({
    user: user,
    token,
  });
});

module.exports = router;
