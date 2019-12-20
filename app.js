const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const debug = require('debug')('app');

const connection = require('./db');

const userRoutes = require('./routes/users')();
const blogRoutes = require('./routes/blog')();
const productRoutes = require('./routes/product')();
const orderRoutes = require('./routes/order')();
const app = express();

const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(express.static('images'));

app.listen(port, function(){
    debug(`Listening on port ${chalk.green(port)}`);
})

app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,PUT,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, X-Auth-Token, content-type");
    next();
})

const urlPrefix = '/api';

app.use(urlPrefix, userRoutes);
app.use(urlPrefix, blogRoutes);
app.use(urlPrefix, productRoutes);
app.use(urlPrefix, orderRoutes);



module.exports = app;
