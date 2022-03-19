const Sequelize = require('sequelize');
var sequelize = new Sequelize('d3r91ar12fb75v', 'qrnjbgtcvuqffg','91d8eae680b3688ee904163b5171e3b77e5e79a8f5c81b22e426712dc351b8e4', {
    host: 'ec2-3-231-254-204.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {rejectUnauthorized: false}
    },
    query: {raw:true}
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize = () => {
    return new Promise ((resolve,reject) => {
        sequelize
        .sync()
        .then(resolve('database sync successful'))
        .catch((err) => reject('unable to sync the database',err));
    });
};

module.exports.getAllPosts = () => {
    return new Promise ((resolve, reject) => {
        Post.findAll()
        .then((data) => resolve(data))
        .catch(reject('no results returned'))
    });
};

module.exports.getPublishedPosts = () => {
    return new Promise ((resolve, reject) => {
        reject();
    });
};

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve,reject) => {
        reject();
    });
};

module.exports.getCategories = () => {
    return new Promise((resolve,reject) => {
        reject();
    });
};

module.exports.addPost = (postData) => {
    return new Promise((resolve,reject) => {
        reject();
    });
};

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve,reject) => {
        Post.findAll({
            where: {
                category: category
            }
        })
        .then((data) => resolve(data))
        .catch(reject('no results returned'))
    });
};

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve,reject) => {
        reject();
    });
};

module.exports.getPostById = (id) => {
    return new Promise((resolve,reject) => {
        reject();
    });
};