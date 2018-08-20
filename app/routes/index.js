'use strict';
const h = require('../helpers');
const passport = require('passport');
const config = require('../config');
module.exports = () => {
    let routes = {
        'get': {
            '/': (req, res, next) => {
                res.render('login');
            },
            '/login': (req, res, next) => {
                res.render('login');
            },
            '/rooms': [h.isAuthenticated, (req, res, next) => {
                res.render('rooms',{
                    //req.user value is populated when deserializeUser function is successfully processed.
                    // Refer index.js in auth module.  done(null, user)
                    // now 'user' is an abject which will be available for the rooms page to fetch information of user
                    user: req.user,
                    host: config.host
                });
            }],
            // h.isAuthenticated is added as the first middleware handler for the route before the actual route handle
            // to check is the user is logged in or not...next() in isAutheticated method in helper is invoked if the user
            // is logged-in which allows the next route handler to be invoked, which in this case is (req, res, next) => 
            '/chatroom/:id': [h.isAuthenticated, (req, res, next) => {
                //find a chatroom with the given id, and render it if the id is found
                //app can be accessed from req stream
                //Express internally extracts all url parameters based on the colon nototaion as expressed in route declaration
                //and puts it in the request object called params
                let getRoom = h.findRoomByID(req.app.locals.chatrooms, req.params.id);
                if(getRoom === undefined){
                    return next()
                }else{
                    res.render('chatroom', {
                        user: req.user,
                        host: config.host,
                        room: getRoom.room,
                        roomID: getRoom.roomID
                    });
                }                
            }],
            '/auth/facebook': passport.authenticate('facebook'),
            '/auth/facebook/callback': passport.authenticate('facebook', {
                successRedirect: '/rooms',
                failureRedirect: '/'
            }),
            '/logout': (req, res, next) => {
                // logout function is made available by passport which clears all the data in session
                // also removes req.user variable
                req.logout();
                res.redirect('/');
            }
            // ,
            // '/setSession' : (req, res, next) =>{
            //     req.session.favColour = 'Red';
            //     res.send("Fav colour set");
            // },
            // '/getSession' : (req, res, next) =>{
            //    res.send("Fav colour: "+ req.session.favColour) ;
            // }
        },
        'post':{

        },
        'NA' : (req, res, next) =>{
            res.status(404).sendFile(process.cwd()+'/views/404.htm')
        }
    }

    return h.route(routes);
}