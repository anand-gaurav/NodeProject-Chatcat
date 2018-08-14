'use strict';
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('../config');
const db = require('../db');

if (process.env.NODE_ENV === 'production') {
    //Initialize sesssion with settings for production
    module.exports = session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true,
        //store is where express-session will store its data, 
        //by default express will store the session data in memory which is not recommended in prod. In-memory opt will not scale
        //and will end up killing your server easily. Mongodb or fast key-value store like Redis
        //are good Node.js option to save the session
        store: new MongoStore({
            mongooseConnection: db.Mongoose.connection
        })
    });
} else {
    //Initialize session with settings for dev
    module.exports = session({
        secret: config.sessionSecret,
        resave: false, // this is by default true..which means our middleware will make tons of db call
        // to save the cookie info even when the data is not modified.
        saveUninitialized: true //set to true in dev env. This option will create session cookie in user session browser
        // as well as associated entry in the session store even when session is not intialized with any data.
    });
}