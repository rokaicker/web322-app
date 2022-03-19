/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rohan Kaicker Student ID: 119070217 Date: March 13, 2022
*
*  Online (Heroku) URL: https://arcane-headland-60683.herokuapp.com/blog 
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

//  Strip-Js setup
const stripJs = require('strip-js');


// Express Handlebars Setup
const exphbs = require('express-handlebars');
const { appendFileSync } = require("fs");
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers : {
        navLink: function(url, options){
            return '<li' + ((url == app.locals.activeRoute) ? 'class="active"' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue,rvalue,options){
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
    }
}));

app.set('view engine', '.hbs');



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

// Fixing Navigation Bar
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = (route=="/") ? "/" : "/" + route.replace(/\/(.*)/,"");
    app.locals.viewingCategory = req.query.category;
    next();
});

// Redirect user to "/about" route
app.get("/", (req,res)=>{
    res.redirect('/blog');
});

// Send the about.html file to display the webpage
app.get("/about", (req,res)=>{
    res.render(path.join(__dirname,"/views/about.hbs"));
});

// This will fetch all the published posts
app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogService.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData});

});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogService.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogService.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

// This will fetch posts either based on category, date, or all posts 
app.get("/posts", (req,res) => {
    if (req.query.category){
        blogService.getPostsByCategory(req.query.category).then((data) => {
            //res.json({data});
            res.render("posts",{posts:data});
        }).catch((err) => {
            //res.json({messge: err});
            res.render("posts",{message:err});
        })
    } else if(req.query.minDate){
        blogService.getPostsByMinDate(req.query.minDate).then((data) => {
            //res.json({data});
            res.render("posts",{posts:data});
        }).catch((err) => {
            //res.json({message: err});
            res.render("posts",{message:err});
        })
    } else {
        blogService.getAllPosts().then((data) => {
            //res.json(data);
            res.render("posts",{posts:data});
        }).catch((err) => {
            //res.json({message: err});
            res.render("posts",{message:err});
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
        //res.json(data);
        res.render("categories",{categories:data});
    }).catch((err) => {
        //res.json({message: err});
        res.render("categories",{message:err});
    })
});

// This will simply send the addPost.html file to the /posts/add route
app.get("/posts/add", (req,res) => {
    res.render(path.join(__dirname, "/views/addPost.hbs"));
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
    res.status(404).render("404");
});

blogService.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart); // Displays port the server is listening on. Callback function "onHttpStart" is called once the "app" starts listening to the port.
}).catch((error) => {
    console.error(err);                 // Displays error if there is one
});
