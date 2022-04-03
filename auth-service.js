// Mongoose setup
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Schema Setup
var assignSchema = new Schema({
    "userName" : String,
    "password": String,
    "email" : String,
    "loginHistory" : [{"dateTime" : Date}, {"userAgent" : String}]
});

let User; // to be defined on new connection see initialize
