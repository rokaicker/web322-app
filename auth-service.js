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

module.exports.registerUser = (userData) => {
    return new Promise((resolve,reject) => {
        // Reject promise if .password does not match .password2
        if (userData.password != userData.password2){
            reject("Passwords do not match");
        } else {
            let newUser = new User(userData);
            newUser.save((err) => {
                if (err){
                    // Error code 11000 check (Duplicate Key)
                    if (err.code == 11000){
                        reject("Username already taken");
                    } else {
                        reject("There was an error creating the user: " + err);
                    }
                } else {
                    resolve();
                }
            });
        }
    });
};

module.exports.checkUser = (userData) => {
    return new Promise((resolve,reject) => {
        // find() method to find same username in database
        User.find({userName: userData.userName})
        .exec()
        .then((users) => {
            // Reject promise if users array is empty or if passwords don't match
            if (users.length == 0){
                reject("Unable to find user: " + userData.userName);
            } else if (users[0].password != userData.password){
                reject("Incorrect Password for user: " + userData.userName);
            }
            users[0].loginHistory.push({dateTime: (new Date()).toString, userAgent: userData.userAgent});
            User.updateOne({userName: users[0].userName}, {$set : {loginHistory: users[0].loginHistory}})
            .exec()
            .then(() => {
                resolve(users[0]);
            })
            .catch((err) => {
                reject("There was an error verifying the user: " + err);
            })
        })
        .catch(() => {
            reject("Unable to find user: " + userData.userName);
        });
    });
};