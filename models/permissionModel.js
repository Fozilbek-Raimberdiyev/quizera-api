const mongoose = require("mongoose")
const {Schema, model} = mongoose;

const permissionsSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    permissions : {
        type : [Object],
        default : [],
    }
})

const Permission = model("permissions", permissionsSchema);


module.exports = Permission;