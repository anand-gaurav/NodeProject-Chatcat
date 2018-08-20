'use strict';
const express = require('express');
const app = new express();
const chatCat = require('./app');
const passport = require('passport');

app.set("port", process.env.PORT || 3000);
app.use(express.static('public')); // to serve static content, express has inbuilt middleware to render static files which implements streams
app.set("view engine", "ejs");
app.set("views", "./views"); 
//by default Express uses views folder to look for dynamic view files
// if you wish to keep the render file to some other folder you can change it.
//you dont need to use __dirname to resolve the path. Express automatically resolves it from the root
//of path folder from where node command was invoked.

// app.get("/", (req, res, next) => {
//     //res.sendFile(__dirname+'/views/login.htm');
//     // use res.render for using ejs template
//     res.render('login', {
//         pageTitle: 'My Login Page'
//     })
// });

app.use(chatCat.session); // session middleware setup is required before mounting router
// Below code brings in passport middleware function designed for integration with express
// It hooks the passport into req and res stream which express provides access to
app.use(passport.initialize());
// This hooks expresse's session middleware with passport. So that it can write to and read from session variable.
// Serialize user and desirialize user method=> That is how they are connected to session mechanism in express.
app.use(passport.session());
app.use('/', chatCat.router);

// app.listen(app.get('port'), () => {
//     console.log('ChatCAT running on port: ', app.get('port'));
// });


chatCat.ioServer(app).listen(app.get('port'), () => {
    console.log('ChatCAT running on port: ', app.get('port'));
});
