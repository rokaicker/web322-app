// Required Modules
const mongoose = require("mongoose");   // To use mongoDB
const bcrypt = require("bcryptjs");     // To be able to encrypt passwords



// Schema Setup
var Schema = mongoose.Schema;
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
        let db = mongoose.createConnection("mongodb+srv://rohank:322@web322.luj4c.mongodb.net/web322_assign6?retryWrites=true&w=majority");
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
            bcrypt.hash(userData.password,10)
            .then((hash) => {
                userData.password = hash;
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
            })
            .catch((err) => {
                reject("There was an error encrypting the password");
            })
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
            } 
            // Below code replaced with hash comparison
            /*else if (users[0].password != userData.password){
                reject("Incorrect Password for user: " + userData.userName);
            }*/
            bcrypt.compare(userData.password, users[0].password)
            .then((result) => {
                if (result === true){
                    users[0].loginHistory.push({dateTime: (new Date()).toString, userAgent: userData.userAgent});
                    User.updateOne({userName: users[0].userName}, {$set : {loginHistory: users[0].loginHistory}})
                    .exec()
                    .then(() => {
                        resolve(users[0]);
                    })
                    .catch((err) => {
                        reject("There was an error verifying the user: " + err);
                    })
                } else {
                    reject("Incorrect Password for user: " + userData.userName);
                }
            })
        })
        .catch(() => {
            reject("Unable to find user: " + userData.userName);
        });
    });
};