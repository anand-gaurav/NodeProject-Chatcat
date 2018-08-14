'use strict';
const passport = require('passport');
const config = require('../config');
const FbStrategy = require('passport-facebook').Strategy;
const h = require('../helpers');

module.exports = () =>{
    //serializeUser function is automatically invoked by passport when authorization process ends.
    //in this case when authProcessor() function done() is invoked, then serializeUser function is invoked
    passport.serializeUser((user,done) => {
        //done method creates a session and stores the user.id (mongo unique id key of collection)
        done(null, user.id);
    });

    passport.deserializeUser((id,done)=>{
        // Find the user data using the id from mongo db
        //passport injects id in the desirialized method
        h.findById(id)
            .then(user => {
                console.log('Deserialization succeeded: '+ user);
                //calling done() in deserializeUser with 'user' data, it will store user object in the request stream
                done(null, user)
            })           
            .catch(error => console.log('Error desirializing user')+ error)
             //after done method is invoked, this user data is made avialable in request stream as req.user
    });


    let authProcessor = (accessToken, refreshToken, profile, done) => {
        //Find a user in the local db using profile.id
        //If the user is found, return the user data using done()
        //If the user is not found, create one in the local db and return
        h.findOne(profile.id)
            .then(result => {
                console.log('User data exist' + JSON.stringify(result));
                if(result){
                    //First argument represent any error in nodejs callback function
                    //Second is the actual result derived from mongodb for the user logged in
                    //Invoking the done method gets this data out from auth pipeline and 
                    //into passport so that it can offer it to the app for its consumption
                    done(null, result);
                }else{
                    // Create a new user and return
                    console.log('Create a new user entry in mongo db');
                    h.createNewUser(profile)
                        .then(newChatUser => {
                            console.log('New user entry suceeded: ' +JSON.stringify(newChatUser));
                            done(null, newChatUser);
                        })
                        .catch(error => console.log('Error creating new user'));
                }
            })
    };
    passport.use(new FbStrategy(config.fb, authProcessor));
}