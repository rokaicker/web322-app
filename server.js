/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rohan Kaicker Student ID: 119070217 Date: February 18, 2022
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

// Multer setup
const multer = require("multer");
const upload = multer();

// Cloudinary Setup
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name:"dydbpvpc6",
    api_key:"894538757627284",
    api_secret:"sRBj8fptXS5i9UJpvpiHJe9sGB8",
    secure:true
});

const streamifier = require("streamifier");



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

// This will fetch posts either based on category, date, or all posts 
app.get("/posts", (req,res) => {
    if (req.query.category){
        blogService.getPostsByCategory(req.query.category).then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({messge: err});
        })
    } else if(req.query.minDate){
        blogService.getPostsByMinDate(req.query.minDate).then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message: err});
        })
    } else {
        blogService.getAllPosts().then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json({message: err});
        })
    }
});

// This will get posts based on the post ID value
app.get("/posts:value",(req,res) => {
    blogService.getPostById(req.params.value).then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
})

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

app.post("/posts/add",upload.single("featureImage"), (req,res) => {
    let streamUpload = (req) => {
        return new Promise((resolve,reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error,result) => {
                    if (result){
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
        blogService.addPost(req.body);
    }).then(() => {
        res.redirect("/posts");
    });
})


// Send 404 status if user is trying to go an invalid route
app.use((req,res) => {
    res.status(404).send("Page Not Found");
});

blogService.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart); // Displays port the server is listening on. Callback function "onHttpStart" is called once the "app" starts listening to the port.
}).catch((error) => {
    console.error(err);                 // Displays error if there is one
});
