const { Router } = require("express");
const { questionController, Question } = require("./questions");
const { subjectController, Subject } = require("./subject");
const { Todo } = require("./todos");
const { resultController } = require("./results");
const checkAuth = require("../middleware/auth");

const router = Router();
router.use(require("body-parser").json());
router.use(
  require("cors")({
    origin: "*",
  })
);
router.get("/", checkAuth, async (req, res) => {
  const userID = req.user.userID;
  let allTodos = await Todo.find({ authorId: userID });
  const todos = allTodos.filter(
    (todo) =>
      !todo.isMaked &&
      new Date(new Date(todo.endDate) - new Date(todo.date)).getDate() <= 3
  );

  res.status(200).send({ todos });
});
router.use("/todos", require("./todos").router);
router.use("/auth", require("./signInAndSignup"));
router.use("/permissions", require("./permissions"));
router.use("/subjects", subjectController);
router.use("/questions", questionController);
router.use("/users", require("./users").router);
router.use("/results", resultController);
module.exports = router;
