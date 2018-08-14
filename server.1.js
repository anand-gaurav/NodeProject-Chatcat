'use strict';
const express = require('express');
const app = new express();

app.set("port", process.env.PORT || 3000);

let helloMiddleware = (req, res, next) => {
    req.hello = "Hello Its me...you get the idea";
    next();
}

app.use("/dashboard",helloMiddleware);

app.get("/", (req, res, next) => {
    res.send('<h1> Hello Express </h1>');
    console.log(req.hello);
});

app.get("/dashboard", (req, res, next) =>{
    res.send('<h1> This is dashboard page </h1>' + req.hello);
});

app.listen(app.get('port'), () => {
    console.log('ChatCAT running on port: ', app.get('port'));
});
