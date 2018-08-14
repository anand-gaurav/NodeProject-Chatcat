'use strict';
const h = require('../helpers');
const passport = require('passport');
module.exports = () => {
    let routes = {
        'get': {
            '/': (req, res, next) => {
                res.render('login');
            },
            '/login': (req, res, next) => {
                res.render('login');
            },
            '/rooms': (req, res, next) => {
                res.render('rooms');
            },
            '/chatroom': (req, res, next) => {
                res.render('chatroom');
            },
            '/auth/facebook': passport.authenticate('facebook'),
            '/auth/facebook/callback': passport.authenticate('facebook', {
                successRedirect: '/rooms',
                failureRedirect: '/'
            })
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