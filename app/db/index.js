'use strict';
const config = require('../config');
const logger = require('../logger');
const Mongoose = require('mongoose')
console.log(config.dbURI);
Mongoose.connect(config.dbURI, { useNewUrlParser: true });

//Log and error if the connection fails
const db = Mongoose.connection;
db.on('error', error => {
    //console.log("MongoDB error :", error);
    logger.log('error', 'Mongoose connection error: '+ error);
});
db.once('open', function () {
    console.log("Mongoose connected");
    // we're connected!
});

// Create a schema that defines the structure for storing user data
const chatUser = new Mongoose.Schema({
    profileId: String,
    fullName: String,
    profilePic: String
});

//Turn schema into usable model
let userModel = Mongoose.model('chatUser', chatUser);

module.exports = {
    Mongoose,
    userModel
}