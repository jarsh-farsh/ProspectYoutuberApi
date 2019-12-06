const mysql = require('mysql');
var connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "P@ssw0rd",
    database: "pydb"
});

connection.getConnection(function(err){
    if(err) throw err;
    console.log("Connected!");
})
module.exports = connection;