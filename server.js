/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rohan Kaicker Student ID: 119070217 Date: February 02, 2022
*
*  Online (Heroku) URL: https://rkaicker-web322-app.herokuapp.com/
*
*  GitHub Repository URL: https://github.com/rokaicker/web322-app
*
********************************************************************************/ 

const express = require("express");
const app = express();
app.use(express.static("public")); // Allows us to declare a folder as "static" --> unchanging files that are required for the site content. 

const path = require("path");
const blogService = require(__dirname + "/blog-service.js")
var HTTP_PORT = process.env.PORT || 8080;



// Obtaining port app listening to
function onHttpStart(){
    console.log("Express http server listening on: " + HTTP_PORT);
}


/*

Redirecting user from the "/" route (aka endpoint) to the "/about" route. Routing = how app responds to client request at specific route/ endpoint. 
Endpoints are URI ("Uniform Resource Identifier" aka path). Routes can have one/ more handler functions which are executed when route is matched. 

Routing has the following structure:

app.METHOD(PATH,HANDLER) --> app = express instance, METHOD = HTTP request method, PATH = endpoint/ route, HANDLER = function executed when route is matched.
Note that the HANDLER function can be an anonymous arrow function. Handler functions = callback functions. 

*/

// Redirect user to "/about" route
app.get("/", (req,res)=>{
    res.redirect('/about');
});

// Send the about.html file to display the webpage
app.get("/about", (req,res)=>{
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

// This will fetch all the published posts
app.get("/blog", (req,res) => {
    blogService.getPublishedPosts().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({message: err});
    })

});

// This will fetch all posts, regardless of publication status
app.get("/posts", (req,res) => {
    blogService.getAllPosts().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({message: err});
    })
});

// This will fetch the different post categories
app.get("/categories", (req,res) => {
    blogService.getCategories().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({message: err});
    })
});

// This will simply send the addPost.html file to the /posts/add route
app.get("/posts/add", (req,res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

// Send 404 status if user is trying to go an invalid route
app.use((req,res) => {
    res.status(404).send("Page Not Found");
});

blogService.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart); // Displays port the server is listening on. Callback function "onHttpStart" is called once the "app" starts listening to the port.
}).catch((error) => {
    console.error(err);                 // Displays error if there is one
});
