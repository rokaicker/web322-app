var express = require("express");
var app = express();
app.use(express.static("public")); // Allows us to declare a folder as "static" --> unchanging files that are required for the site content. 

var path = require("path");

var HTTP_PORT = process.env.PORT || 8080;



// Obtaining port app listening to
function onHttpStart(){
    console.log("Express http server listening on: " + HTTP_PORT);
}
app.listen(HTTP_PORT, onHttpStart); // Displays port the server is listening on. Callback function "onHttpStart" is called once the "app" starts listening to the port.


/*

Redirecting user from the "/" route (aka endpoint) to the "/about" route. Routing = how app responds to client request at specific route/ endpoint. 
Endpoints are URI ("Uniform Resource Identifier" aka path). Routes can have one/ more handler functions which are executed when route is matched. 

Routing has the following structure:

app.METHOD(PATH,HANDLER) --> app = express instance, METHOD = HTTP request method, PATH = endpoint/ route, HANDLER = function executed when route is matched.
Note that the HANDLER function can be an anonymous arrow function. Handler functions = callback functions. 

*/

app.get("/", (req,res)=>{
    res.redirect('/about');
});

app.get("/about", (req,res)=>{
    res.sendFile(path.join(__dirname,"/views/about.html"));
});
