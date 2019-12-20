var express = require('express');
var connection = require('../db');
var mysql = require('mysql');

function routes() {
  var userRoutes = express.Router();

  //Retrieve all users
  userRoutes.get('/users', function (req, res) {
    var query = "SELECT id, role_id, username, first_name, last_name, date_joined FROM users";
    var getRoles = req.query.getRoles;

    connection.query(query, function (error, userResults) {
      if (error) throw error;
      if(getRoles == 'true'){
        query = "SELECT * FROM roles"
        connection.query(query, function(error, roleResults){
          if(error) throw error;
          userResults.forEach(u => {
            u.role = roleResults.find(r => r.id === u.role_id);
          })
          return res.json(userResults);
        })
      }else{
        return res.json(userResults);
      }
    })
  });

  //Retrieve user by id
  userRoutes.get('/users/:id', function (req, res) {
    let id = req.params.id;
    if (!id) {
      return res.status(400).send({ error: true, message: "No id was provided to query" });
    }
    var query = 'SELECT id, role_id, username, first_name, last_name, date_joined FROM users WHERE id=?';
    connection.query(query, id, function (error, results, fields) {
      if (error) throw error;
      return res.json(results[0]);
    })
  })

  //Add new user
  userRoutes.post('/users', function (req, res) {
    let user = req.body;

    if (!user) {
      return res.status(400).send({ error: true, message: "Please provide user" });
    }

    var check = "SELECT * FROM users where username=?";
    connection.query(check, user.username, function (error, results, fields) {
      if (error) throw error;
      //If email exists, then return 200 okay with error message
      if (results[0]) {
        return res.status(200).send({ error: true, message: "Email address already exists" });
      } else {
        var query = "INSERT INTO users SET ? ";
        connection.query(query, user, function (error, results, fields) {
          if (error) throw error;
          return res.json(results);
        })
      }
    });

  })

  //Update user
  userRoutes.put('/users', function (req, res) {
    var query = "UPDATE users SET role_id = ?, username = ?, first_name = ?, last_name = ? WHERE id = ?";
    var table = [req.body.role_id, req.body.username, req.body.first_name, req.body.last_name, req.body.id];
    query = mysql.format(query, table);

    connection.query(query, function (error, results, fields) {
      if (error) throw error;
      return res.json({error:false, data:results});
        });
  })

  //Delete user
  userRoutes.delete('/users', function(req,res){
    var query = "DELETE FROM users WHERE id = ?";
    let id = req.body.id;
    
    if(!id){
      return res.status(400).send({error: true, message:"Id not provided"});
    }

    connection.query(query, id, function(error,results,fields){
      if(error)throw error;
      return res.json(results);
    })
  });

  //Login user
  userRoutes.post('/login', function(req, res){
    var query = "SELECT * FROM users WHERE username = ? AND password = ?"
    var table = [req.body.username, req.body.password];
    query = mysql.format(query, table);

    connection.query(query, function(error, results){
      if(error)throw error;
      return res.json(results[0]);   
    })
  })

  //Get all roles
  userRoutes.get('/roles', function(req, res){
    var query = "SELECT * FROM roles"

    connection.query(query, function(error, results){
      if(error) throw error;
      return res.json(results);
    })
  })

  //Get Role by id
  userRoutes.get('/roles/:id', function(req, res){
    var query = "SELECT * FROM roles WHERE id = ?";
    let id = req.params.id;

    connection.query(query, id, function(error, results){
      if(error) throw error;
      return res.json(results[0]);
    })
  })

  return userRoutes;
}

module.exports = routes;
