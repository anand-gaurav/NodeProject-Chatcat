'use strict';
const router = require('express').Router();
const db = require('../db');
const crypto = require('crypto');

//Iterate through the routes  object and mount the routes
let _registerRoutes = (routes, method) => {
    for (let key in routes) {
        if (typeof routes[key] === 'object' && routes[key] != null && !(routes[key] instanceof Array)) {
            _registerRoutes(routes[key], key);
        } else {
            //Register routes
            if (method === 'get') {
                router.get(key, routes[key]);
            } else if (method === 'post') {
                router.post(key, routes[key]);
            } else {
                router.use(routes[key]);
            }
        }
    }
}

let route = routes => {
    _registerRoutes(routes);
    return router;
}

// Find a single user based on a key
let findOne = (profileID) => {
    return new Promise((resolve, reject) => {
        db.userModel.findOne({ 'profileId': profileID }, (error, user) => {
            if (error) {
                reject(error);
            } else {
                resolve(user);
            }
        })
    })
}

let createNewUser = (profile) => {
    return new Promise((resolve, reject) => {
        let newChatUser = new db.userModel({
            profileId: profile.id,
            fullName: profile.displayName,
            profilePic: profile.photos[0].value || ''
        });
        newChatUser.save((error) => {
            if (error) {
                reject(error);
            } else {
                resolve(newChatUser);
            }
        });
    });
}

// The ES6 promisified version of findById
let findById = id => {
    return new Promise((resolve, reject) => {
        db.userModel.findById(id, (error, user) => {
            if (error) {
                reject(error);
            } else {
                resolve(user);
            }
        });
    });
}

// A middleware that checks to see if the user is authenicated & logged in
let isAuthenticated = (req, res, next) => {
    //isAuthenticated is an inbuilt function in passport and returns true is the user is indeed logged in
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}

//Find a chatroom by a given name
let findRoomByName = (allrooms, room) => {
    //http://2ality.com/2013/12/array-prototype-find.html
    let findRoom = allrooms.findIndex((element, index, array) => {
        if (element.room === room) {
            return true;
        } else {
            return false;
        }
    });
    console.log(findRoom);
    return findRoom > -1 ? true : false;
}

//A function that generates a unique roomID using node crypto module
let randomHex = () => {
    return crypto.randomBytes(24).toString('hex');
}

//Find a chatroom with a given id
let findRoomByID = (allrooms, roomID) => {
    console.log('All Rooms' + JSON.stringify(allrooms));
    console.log('RoomID' + roomID);
    return allrooms.find((element, index, array) => {
        if (element.roomID === roomID) {
            console.log(element);
            return true;
        } else {
            console.log('No chatroom found' + JSON.stringify(element));
            return false;
        }
    });
};

let addUserToRoom = (allrooms, data, socket) => {
    let getRoom = findRoomByID(allrooms, data.roomID);
    if (getRoom !== undefined) {
        //Fetch active user's objectID which is used by our session mechnaism and will be used as unique identified in the chatroom
        // value of user is available in socket due to bridge that was created in index.js app module line 25 :  io.use((socket, next) => {
        // since we dont have access to req stream in the helper module, we will utilize the socket bridge to fetch user details.
        //The socket.request object is kinda like the http req object, only that it is available from within the socket interface.
        let userID = socket.request.session.passport.user;
        let checkUser = getRoom.users.findIndex((element, index, array) => {
            if (element.userID === userID) {
                return true;
            } else {
                return false;
            }
        });
        // If the user is already present in the room, remove them first
        if (checkUser > -1) {
            getRoom.users.splice(checkUser, 1);
        }
        //Push the user into the room's user array
        getRoom.users.push({
            socketID: socket.id,
            userID,
            user: data.user,
            userPic: data.userPic
        });
        //Join the room channel
        socket.join(data.roomID);

        //Return updated room object
        return getRoom;
    }
}

// Find and purge user when a socket disconnects
let removeUserFromRoom = (allrooms, socket) => {
    for(let room of allrooms){
        //Find the user
        let findUser = room.users.findIndex((element, index, array) => {
            return element.socketID === socket.id ? true : false;
        });
        if(findUser > -1){
            // Will use socket inbuilt leave method to remove user
            socket.leave(room.roomID);
            room.users.splice(findUser, 1);
            return room;
        }
    }
    
}

module.exports = {
    route: route,
    findOne,
    createNewUser,
    findById,
    isAuthenticated,
    findRoomByName,
    randomHex,
    findRoomByID,
    addUserToRoom,
    removeUserFromRoom
}