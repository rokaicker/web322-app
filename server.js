/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rohan Kaicker Student ID: 119070217 Date: April 08, 2022
*
*  Online (Heroku) URL:     
*
*  GitHub Repository URL: https://github.com/rokaicker/web322-app
*
********************************************************************************/ 
// Required Modules
const blogService = require(__dirname + "/blog-service.js");    // Blog middleware (ex. adding/ deleting posts)
const express = require("express");                             // Express to be used as our web framework
const path = require("path");                                   // Provides utilties for working with file/ directory pathes
const multer = require("multer");                               // Node.js middleware for handling multipart/form-data (primary use = uploading files)
const cloudinary = require("cloudinary").v2;                    // Cloudinary is used for image/ video hosting
const streamifier = require("streamifier");                     // Allows us to convert buffer/ string into readable stream
const stripJs = require('strip-js');                            // Strips JavaScript code from HTML text (ex. for safety reasons, prevent malicious scripts from running)
const exphbs = require('express-handlebars');                   // Express handlebars view engine 
const { appendFileSync } = require("fs");                       // TBD
const authData = require(__dirname + "/auth-service.js");       // User Authentication middleware 
const clientSessions = require("client-sessions");              // Middleware to implement sessions in cookies

// Providing value for HTTP_PORT for local webserver
const HTTP_PORT = process.env.PORT || 8080;

// Express App Setup
const app = express();
app.use(express.static("public"));              // Allows us to declare a folder as "static" --> unchanging files that are required for the site content. 
app.use(express.urlencoded({extended:true}));   // Allows us to recognize incoming objects as strings/ arrays
app.use(function(req,res,next){                 // Fixes the display of the navigation bar based on the current active route
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Multer Setup
const upload = multer();

// Cloudinary Setup
cloudinary.config({
    cloud_name:"dydbpvpc6",
    api_key:"894538757627284",
    api_secret:"sRBj8fptXS5i9UJpvpiHJe9sGB8",
    secure:true
});

// Express-Handlebars Setup (includes usage of strip-js in helper function)
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers : {
        navLink: function(url, options){
            return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue,rvalue,options){
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);S
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
app.set('view engine', '.hbs'); // Sets our view engine to use .hbs files


// Client-Sessions Setup -> Includes middleware to ensure templates have access to session object, and function that checks if user is logged in (if not, user will be redirected to /login route)
app.use(clientSessions({
    cookieName: "session",
    secret: "rohan_web322_assign6",
    duration: 2 * 60 * 1000,    // 2 minutes original duration
    activeDuration: 60 * 1000   // 1 minute extension
}));
app.use((req,res,next) => {
    res.locals.session = req.session;
    next();
})
function ensureLogin(req,res,next) {
    if(!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

// Function that reports the port that the app listening to
function onHttpStart(){
    console.log("Express http server listening on: " + HTTP_PORT);
}


/* ROUTE HANDLING*/
// Root page gets redirected to "/blog" route
app.get("/", (req,res)=>{
    res.redirect('/blog');
});

// ABOUT PAGE
app.get("/about", (req,res)=>{
    res.render(path.join(__dirname,"/views/about.hbs"));
});



// BLOG PAGE
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



// POSTS PAGE
// This will fetch posts either based on category, date, or all posts 
app.get("/posts", ensureLogin, (req,res) => {
    if (req.query.category){
        blogService.getPostsByCategory(req.query.category).then((data) => {
            if (data.length > 0){
                res.render("posts",{posts:data});
            } else {
                res.render("posts", {message: "no results"});
            }
        }).catch((err) => {
            res.render("posts",{message:err});
        })
    } else if(req.query.minDate){
        blogService.getPostsByMinDate(req.query.minDate).then((data) => {
            if (data.length > 0){
                res.render("posts",{posts:data});
            } else {
                res.render("posts", {message: "no results"});
            }
        }).catch((err) => {
            res.render("posts",{message:err});
        })
    } else {
        blogService.getAllPosts().then((data) => {
            if (data.length > 0){
                res.render("posts",{posts:data});
            } else {
                res.render("posts", {message: "no results"});
            }
        }).catch((err) => {
            res.render("posts",{message:err});
        })
    }
});
// This will get posts based on the post ID value
app.get("/posts:value", ensureLogin, (req,res) => {
    blogService.getPostById(req.params.value).then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
})
// This will simply send the addPost.html file to the /posts/add route
app.get("/posts/add", ensureLogin, (req,res) => {
    blogService.getCategories()
    .then((data) => res.render("addPost", {categories: data}))
    .catch((err) => res.render("addPost", {categories: []}));
});
app.post("/posts/add", ensureLogin, upload.single("featureImage"), (req,res) => {
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
    }).then(res.redirect("/posts"));
});
app.get("/posts/delete/:id", ensureLogin, (req,res) => {
    blogService.deletePostById(req.params.id)
    .then(res.redirect("/posts"))
    .catch((err) => res.status(500).send("Unable to Remove Post / Post not found"));
})



// CATEGORIES PAGE
// This will fetch the different post categories
app.get("/categories", ensureLogin, (req,res) => {
    blogService.getCategories().then((data) => {
        console.log(data.length);
        if (data.length > 0){
            res.render("categories", {categories: data});
        } else {
            res.render("categories", {message: "no results"});
        }
    }).catch((err) => {
        res.render("categories",{message:err});
    })
});
app.get("/categories/add", ensureLogin, (req,res) => {
    res.render(path.join(__dirname, "/views/addCategory.hbs"));
});
app.post("/categories/add", ensureLogin, (req,res) => {
    blogService.addCategory(req.body)
    .then(res.redirect("/categories"));
});
app.get("/categories/delete/:id", ensureLogin, (req,res) => {
    blogService.deleteCategoryById(req.params.id)
    .then(res.redirect("/categories"))
    .catch((err) => res.status(500).send("Unable to Remove Category / Category not found"));
});


// LOGIN / LOGOUT PAGES
app.get("/login", (req,res) => {
    res.render("login");
});

app.post("/login", (req,res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
    .then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/posts');
    })
    .catch((err) => {
        res.render("login", {errorMessage: err, userName: req.body.userName});
    });
});

app.get("/logout", (req,res) => {
    req.session.reset();
    res.redirect("/");
});

// REGISTER PAGE
app.get("/register", (req,res) => {
    res.render("register");
});

app.post("/register", (req,res) => {
    authData.registerUser(req.body)
    .then(() => {
        res.render("register", {successMessage: "User created"});
    })
    .catch((err) => {
        res.render("register", {errorMessage: err, userName: req.body.userName});
    })
});


// USER HISTORY PAGE
app.get("/userHistory", ensureLogin, (req,res) => {
    res.render("userHistory");
});



// 404 PAGE
// Send 404 status if user is trying to go an invalid route
app.use((req,res) => {
    res.status(404).render("404");
});


// Runs on web page initialization
blogService.initialize()
.then(authData.initialize())
.then(() => {
    app.listen(HTTP_PORT, onHttpStart); // Displays port the server is listening on. Callback function "onHttpStart" is called once the "app" starts listening to the port.
}).catch((error) => {
    console.error(err);                 // Displays error if there is one
});

