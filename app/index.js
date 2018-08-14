'use strict';
//Social Authentication Logic
//app module is the core that we have defined and we have added our authentication module.
//So as core app module is brought into sever.js, the authentication code gets up and runnning.
require('./auth')();

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
    session: require('./session')
}
