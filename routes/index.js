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
  const todos = allTodos.filter((todo) => {
    return (
      !todo.isMaked &&
      new Date(new Date(todo.endDate) - new Date()).getDate() <= 3 &&
      new Date(new Date(todo.endDate) - new Date()).getFullYear() >= 1970
    );
  });
  allTodos.forEach(async (todo) => {
    if (
      !todo.isMaked &&
      new Date(new Date(todo.endDate) - new Date()).getFullYear() < 1970 &&
      !todo.isLated
    ) {
      todo.isLated = true;
      return Todo.findByIdAndUpdate(
        todo._id,
        todo,
        { new: true },
        (err, data) => {
          if (err) {
            console.log({ message: "Error finding todo" });
          }
          if (!data) {
            console.log({ message: "Todo not found" });
          }
          console.log({ message: "Todo succesfully updated" });
        }
      );
    }
  });

  res.status(200).send({ todos });
});
router.use("/todos", require("./todos").router);
router.use("/auth", require("./signInAndSignup"));
router.use("/permissions", require("./permissions"));
router.use("/subjects", subjectController);
router.use("/questions", questionController);
router.use("/users", require("./users").router);
router.use("/results", resultController);
router.use("/events", require("./latePrayTimes"));
module.exports = router;
