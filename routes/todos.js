const bodyParser = require("body-parser");
const { Router } = require("express");
const Joi = require("joi");
const mongoose = require("mongoose");
const checkAuth = require("../middleware/auth")

const router = Router();
router.use(bodyParser.json())
//todoschema
let todoSchema = mongoose.Schema({
  name: String,
  description: String,
  date: { type: Date, default: Date.now },
  img: Buffer,
  endDate: Date,
  authorId : String,
  isMaked : Boolean,
  makedDate : Date
});

let todoValidSchema = Joi.object({
  name : Joi.string().required(),
  description :Joi.string().required(),
  endDate : Joi.date().required(),
  authorId : Joi.string().required(),
  isMaked : Joi.boolean().required(),
})

//todo model
let Todo = mongoose.model("todos", todoSchema);

//get all data
router.get("/", checkAuth, async (req, res) => {
  let pageNumber = req.query.page || 1;
  let pageLimit = req.query.limit || 10;
  let allTodos = await Todo.find({authorId : req.user.userID})
    .skip((pageNumber - 1) * pageLimit)
    .limit(pageLimit);
    let total = await Todo.countDocuments()
  res.status(200).send({
    todos : allTodos,
    total : total
  });
});

//add todo
router.post("/add",checkAuth, async (req, res) => {
  let body = req.body;
  req.body.authorId = req.user.userID
  let {error,value} = todoValidSchema.validate(req.body);
  if(error) {
  return res.status(400).send({message : error.details[0].message})
  }
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

//update status todo
router.put("/statusUpdate", checkAuth, async(req, res) => {
  let data = req.body.status
  const ID = req.query.ID;
const updated =   await Todo.updateOne({_id : ID }, {$set : {isMaked : data, makedDate : new Date().getTime()}});
return res.status(200).send(updated)
})

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
