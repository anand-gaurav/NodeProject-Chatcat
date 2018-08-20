'use strict';
const h = require('../helpers');
module.exports = (io, app) => {
    let allrooms = app.locals.chatrooms;
    // allrooms.push({
    //     room: 'Good Food',
    //     roomID: '0001',
    //     users: []
    // });
    
    //socket io.of is now listening to roomlist pipeline on our socket.io connection
    io.of('/roomlist').on('connection', socket => {
        console.log('Connected to client');

        socket.on('getChatrooms', () => {
            socket.emit('chatRoomsList', JSON.stringify(allrooms));
        });

        socket.on('createNewRoom', newRoomInput => {
            console.log(newRoomInput);
            //check to see if a room with the same title exists or not, if not, create one and broadcast it to everyone
            if(!(h.findRoomByName(allrooms, newRoomInput))) {
                allrooms.push({
                    room: newRoomInput,
                    roomID: h.randomHex(),
                    users: []
                });
                //Emit an updated list to the creator, only emits data back to actively connected socket
                console.log(JSON.stringify(allrooms));
                socket.emit('chatRoomsList', JSON.stringify(allrooms));
                //Emit an updated list to everyone connected to rooms page
                socket.broadcast.emit('chatRoomsList', JSON.stringify(allrooms));
            }
        });
    });

//below namespace for creating a seperate channel for Chatrooms. Corresponding client connection is invoked from chatroom.ejs
    io.of('/chatter').on('connection', socket => {
        socket.on('join', data => {
            console.log('Chatter Join: ' + JSON.stringify(data));
            let userList = h.addUserToRoom(allrooms, data, socket);
            console.log('UserList:' + JSON.stringify(userList));
            // Push the variable to all users who are connected to this chatroom
            //'socket.broadcast.to' method to first direct our event emission to a roomID &
            //dispatches an event to all sockets connected to a given roomID channel
            //however this msg is not sent back to the socket that has created the event in first place.
            socket.broadcast.to(data.roomID).emit('updateUserList', JSON.stringify(userList.users));
            //now emit the event back to the originating socket i.e the user who has just joined in so that he gets access to updated list as well
            socket.emit('updateUserList', JSON.stringify(userList.users));
        });
        // When a users leave or navigates away from the page, where an active socket.io connection was running, socket.io fires
        // a buit-in event called 'disconnect' and it also enables us to use 'socket' keyword to get the id of the disconnected socket
        socket.on('disconnect', () => {
            //Find the room, to which the socket is connected to and purge the user
            let room = h.removeUserFromRoom(allrooms, socket);
            //shorthand notation for 'socket.broadcast.to' is socket.to
            socket.to(room.roomID).emit('updateUserList', JSON.stringify(room.users));
        });

        socket.on('newMessage', data => {
            socket.to(data.roomID).emit('inMessage', JSON.stringify(data));
        });

    });
}