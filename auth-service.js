// Mongoose setup
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Schema Setup
var assignSchema = new Schema({
    "userName" : {
        "type": String,
        "unique" : true
    },
    "password": String,
    "email" : String,
    "loginHistory" : [{"dateTime" : Date}, {"userAgent" : String}]
});

let User; // to be defined on new connection see initialize

// initialize() creates connection to MongoDB in Atlas
//      Creates connection inside of a promise, if connection is successful promise is resolved().
//      Otherwise the promise is rejected()
module.exports.initialize = () => {
    return new Promise ((resolve,reject) => {
        let db = mongoose.createConnection();
        db.on('error', (err) => {
            reject(err);    // reject promise with provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        })
    });
};

