const { Router } = require("express");
const { User, userValSchema } = require("./users");
const bcryptjs = require("bcryptjs");
const router = Router();
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/auth");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, `public/uploads/`);
  },
  filename: function (req, file, callback) {
    const filename = file.originalname.split(" ").join("_");
    callback(null, filename);
  },
});
const upload = multer({
  storage: storage,
});

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
  let comparedPassword = await bcryptjs.compare(password, existedUser.password);
  if (!comparedPassword) {
    return res.status(400).json({
      message: "Parol xato kiritildi",
    });
  }
  // let jsonSignature = await bcryptjs.hash(process.env.JSON_SIGNATURE, 10);
  let payload = {
    userID: existedUser._id,
    email: existedUser.email,
  };
  const token = jwt.sign(payload, process.env.JSON_SIGNATURE, {
    expiresIn: 60 * 60 * 24,
  });

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

  let existedEmail = await User.findOne({ email });
  let existedPhoneNumber = await User.findOne({ phoneNumber });
  if (existedEmail) {
    return res.status(400).json({
      message: "Bu email orqali allaqachon tizimdan ro'yhatdan o'tilgan",
    });
  }
  if (existedPhoneNumber) {
    return res.status(400).json({
      message: "Bu raqam orqali allaqachon tizimdan ro'yhatdan o'tilgan",
    });
  }
  try {
    let user = await User(value);
    let savedUser = await user.save();
    // let jsonSignature = await bcryptjs.hash(process.env.JSON_SIGNATURE, 10);
    let payload = {
      userID: savedUser._id,
      email: savedUser.email,
    };
    const token = jwt.sign(payload, process.env.JSON_SIGNATURE, {
      expiresIn: 60 * 60 * 24,
    });
    savedUser = await User.find().select({
      password: 0,
    });
    return res.status(201).send({
      user: user,
      token,
    });
  } catch (e) {
    res.errored.message = "Server error";
  }
});

//get-by-email
router.get("/user/:email", checkAuth, async (req, res) => {
  const email = req.params.email;
  if (!email) {
    return res.status(400).send({ message: "Bad request" });
  }
  let users = await User.find();
  users = users.filter((user) =>
    user.email.toLocaleLowerCase().includes(email.toLocaleLowerCase())
  );
  return res.status(200).send(users);
});

//get-by-id
router.get("/:id/user", checkAuth, async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).send({ message: "Bad request" });
  }
  let user = await User.findById(id);
  user.password = undefined;
  return res.status(200).send(user);
});

//get-by-id currentuser
router.get("/user", checkAuth, async (req, res) => {
  const user = req.user;
  let currentUser = await User.findById(user.userID);
  const role = currentUser.role;
  res.status(200).send(role || "student");
});

//update user
router.put(
  "/updateUser",
  upload.single("file"),
  checkAuth,
  async (req, res) => {
    let user = JSON.parse(req.body.form);
    user.pathImage = process.env.HOST + req.file.path;
    const updated = await User.updateOne({ _id: user._id }, { $set: user });
    return res.status(200).send({ message: "Muvaffaqqiyatli", updated, user });
  }
);

//delete user
router.delete("/delete", async (req, res) => {
  User.findByIdAndRemove(req.query.ID, (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting user" });
    }

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ message: "User succesfully deleted" });
  });
});

module.exports = router;
