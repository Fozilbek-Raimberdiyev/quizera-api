const bodyParser = require("body-parser");
const { Router } = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");

const router = Router();
router.use(bodyParser.json())
//todoschema
let todoSchema = mongoose.Schema({
  name: String,
  description: String,
  date: { type: Date, default: Date.now },
  img: Buffer,
  endDate: Date,
});

//todo model
let Todo = mongoose.model("todos", todoSchema);

//get all data
router.get("/", async (req, res) => {
  // res.json({message : "Keldi"})
  let pageNumber = req.query.page || 1;
  let pageLimit = req.query.limit || 10;
  let allTodos = await Todo.find()
    .skip((pageNumber - 1) * pageLimit)
    .limit(pageLimit);
    let total = await Todo.countDocuments()
  res.status(200).send({
    todos : allTodos,
    total : total
  });
});

//add todo
router.post("/add", async (req, res) => {
  let body = req.body;
  const todo = new Todo(body);
  const savedTodo = await todo.save();
  res.status(201).send({ message: "Todo added succesfully" });
});

//get by id
router.get("/:id", async (req, res) => {
  let id = req.params.id;
  let todo = await Todo.findById(id);
  if (!todo) {
    return;
  }
  res.status(200).send(todo);
});

//update  by id todo
router.put("/update", async (req, res) => {
  Todo.findByIdAndUpdate(req.query.ID, req.body, { new: true }, (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error finding todo" });
    }
    if (!data) {
      return res.status(404).json({ message: "Todo not found" });
    }
    return res.json({ message: "Todo succesfully updated" });
  });
});

//delete by id
router.delete("/delete", async (req, res) => {
  Todo.findByIdAndRemove(req.query.ID, (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting todo" });
    }
    if (!data) {
      return res.status(404).json({ message: "Todo not found" });
    }
    return res.json({ message: "Todo succesfully deleted" });
  });
});

module.exports = router;
