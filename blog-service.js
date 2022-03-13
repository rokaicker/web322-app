const e = require("express");
const fs = require("fs");

// Declaration of "posts" and "categories" array
var posts = [];
var categories = [];


module.exports.initialize = () => {
    return new Promise ((resolve,reject) => {
        fs.readFile('./data/posts.json', (err,data) => {
            if(err){
                reject("Error Reading Posts File!");
            } else {
                posts = JSON.parse(data);
            }
        });

        fs.readFile('./data/categories.json', (err,data) => {
            if(err){
                reject("Error Reading Categories File!");
            } else {
                categories = JSON.parse(data);
            }
        });
        resolve();
    })
};

module.exports.getAllPosts = () => {
    return new Promise ((resolve, reject) => {
        if(posts.length == 0){
            reject("No Posts Found!")
        } else {
            resolve(posts)
        }
    })
};

module.exports.getPublishedPosts = () => {
    return new Promise ((resolve, reject) => {
        var publishedPosts = posts.filter(post => post.published == true);
        if (publishedPosts.length == 0){
            reject("No Published Posts Found!");
        } else {
            resolve(publishedPosts);
        }
    })
};

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve,reject) => {
        var publishedCatPosts = posts.filter(post => {
            return (post.published == true && post.category == category);
        });
        if (publishedCatPosts.length == 0){
            reject("No Published Posts Found With This Category!");
        } else {
            resolve(publishedCatPosts);
        }
    })
};

module.exports.getCategories = () => {
    return new Promise((resolve,reject) => {
        if(categories.length == 0){
            reject("No Categories Found!");
        } else{
            resolve(categories);
        }
    })
};

module.exports.addPost = (postData) => {
    return new Promise((resolve,reject) => {
        if(postData.published == undefined){
            postData.published = false;
        } else {
            postData.published = true;
        }
        postData.id = posts.length + 1;
        postData.postDate = new Date().toISOString().slice(0,10);
        posts.push(postData);
        resolve(postData); 
    })
};

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve,reject) => {
        const postsByCategory = posts.filter(post => post.category == category);
        if (postsByCategory.length == 0){
            reject("No posts have been made with these category");
        }
        resolve(postsByCategory);
    })
};

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve,reject) => {
        const postByDate = posts.filter(post => new Date(post.postDate) >= new Date(minDateStr));
        if (postByDate.length == 0){
            reject("No posts have been made after the supplied date");
        }
        resolve(postByDate);
    })
};

module.exports.getPostById = (id) => {
    return new Promise((resolve,reject) => {
        const postsByID = posts.find(post => post.id == id);
        if (postsByID == null){
            reject("No posts have been found with this id");
        }
        resolve(postsByID);
    })
};