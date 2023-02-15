const mongoose = require("mongoose")
const {Schema, model} = mongoose;

const permisionsSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    actions : {
        type : [String],
        default : [],
    }
})

const Permission = model("permissions", permisionsSchema);


module.exports = Permission;