'use strict';
//Social Authentication Logic
//app module is the core that we have defined and we have added our authentication module.
//So as core app module is brought into sever.js, the authentication code gets up and runnning.
require('./auth')();

//Create an IO server instance and use it to use  socket.io powered version of http server
//app variable is express app instance which will be binded to node http server
let ioServer = app => {
    //app.locals namespace allows us to define application level variable in express and these are direcrtly made available to us
    //using the app keyword from anywhere in the application and also within the request stream
    // u can treat app.locals.chatrooms as an array and it will be stored in memory and cannot be scaled beyond a point.
    //try to implement a datastore at later stage to overcome memory issue.
    app.locals.chatrooms = [];
    //server instance from http module
    //Express app is binded with newly created server instance
    const server = require('http').Server(app);
    //invoke socket.io construct and pass the server instance
    const io = require('socket.io')(server);
    //access active user profile in socket.io code. and session data is stored in req stream which we dont have access
    //to in our socket module. To bridge the gap,we can repurpose our session middleware and make it work with socket.io
    //socket.io allows to write their own middleware function as well. Using this, we can employ the services of io.use stmt
    //this then runs for every socket instance which connects to the server, the socket.req entity will have user data as well.
    // below code shows io.use with callback function. socket instance will be injected by socket.io
    io.use((socket, next) => {
        //below code will get the express session and invoke it passing the socket.request which will contain the request object
        // followed by empty object. Our session middlware based on the req object will fetch the associated profile
        // of the active user from the session and provide that to the socket. However we don't wish to write back to the session
        // so we leave the response part of middleware invocation as empty. This is all we need for socket.io to read directly from express session     
        require('./session')(socket.request, {}, next);
    })
    //this require stm  brings in and executes all the socket.io code that we will write in the context of our ioServer function
    // while still allowing us to seperate out the code into its own unique file .
    require('./socket')(io, app);
    return server;
}

// const router = require('express').Router();

// router.get('/', (req, res, next) => {
//     res.render('login');
// });
// router.get('/login', (req, res, next) => {
//     res.render('login');
// });
// router.get('/chats', (req, res, next) => {
//     res.render('chatroom');
// });
// router.get('/rooms', (req, res, next) => {
//     res.render('rooms');
// });

// router.use((req, res, next) => {
//     res.status(404).sendFile(process.cwd() +'/views/404.htm'); 
//     // process.cwd() method will always resolve to the absolute path to the folder which contains server.js file
// });

// module.exports = {
//     router
// }


module.exports = {
    router : require('./routes')(),
    session: require('./session'),
    ioServer
}
