const express = require('express');
var connection = require('../db');
const mysql = require('mysql');

function routes(){
    var blogRoutes = express.Router();

    //Get all blogs
    blogRoutes.get('/blogs', function(req, res){
        var query = "SELECT * FROM blogs";

        connection.query(query, function(error, results, fields){
            if(error) throw error;
            return res.json(results);   
        });
    })

    //Get blog by id
    blogRoutes.get('/blogs/:id', function(req, res){
        var query = "SELECT * FROM blogs WHERE id=?";
        let id = req.params.id;

        if(!id){
            return res.status(400).send({error:true, message:"Blog doesn't exist"});
        }

        

        connection.query(query, id, function(error, results, fields){
            if(error) throw error;          
            return res.json(results);         
        })
    })

    //Insert blog
    blogRoutes.post('/blogs', function(req, res){
        var query = "INSERT INTO blogs SET ?";
        let blog = req.body;

        if(!blog){
            res.status(400).send({error:true, message:"No blog data was sent"});
        }

        connection.query(query, blog, function(error, results){
            if(error) throw error;
            return res.json(results);   
        })

    })

    //Update blog
    blogRoutes.put('/blogs', function(req, res){
        var query = "UPDATE blogs SET title = ?, body = ?, confirmed = ?, modified_on = ? WHERE id = ?";
        var table = [req.body.title, req.body.body, req.body.confirmed, new Date().toJSON().slice(0, 19).replace('T', ' '), req.body.id];
        query = mysql.format(query, table);

        connection.query(query, function(error, results, fields){
            if(error) throw error;
            return res.json({error:false, data:results});   
        })
    })

    //Delete blog
    blogRoutes.delete('/blogs', function(req, res){
        var query = "DELETE FROM blogs WHERE id = ?";
        let id = req.body.id;

        if(!id){
            res.status(400).send({error:true, message:"Id was not defined for blog deletion"});
        }

        connection.query(query, id, function(error, results){
            if(error) throw error;
            return res.json({error: false, data:results});   
        })
    })

    //Get all comments
    blogRoutes.get('/comments', function(req, res){
        var query = "SELECT * FROM comments";

        connection.query(query, function(error, results){
            if(error) throw error;
            return res.json(results);           
        });
    })

    //Get comment by id
    blogRoutes.get('/comments/:id', function(req,res){
        var query = "SELECT * FROM comments WHERE id = ?";
        let id = req.params.id;

        if(!id){
            res.status(400).send({error:true, message:"Error getting id from route for comment"});
        }

        connection.query(query, id, function(error, results){
            if(error) throw error;
            return res.json(results);   
        })
    })

    //Add a comment
    blogRoutes.post('/comments', function(req,res){
        var commentQuery = "INSERT INTO comments SET ?";
        let comment = req.body.comment;
        comment.created_on = new Date().toJSON().slice(0, 19).replace('T', ' ');
        comment.modified_on = comment.created_on;

        var blogCommentQuery = "INSERT INTO blogcomments SET blog_id = ?, comment_id = ?"

        if(!comment){
            res.status(400).send({error:true, message:"There was an error getting the data to insert into db"});
        }

        connection.query(commentQuery, comment, function(error, results){
            if(error)throw error;

            var table = [req.body.blog_id, results.insertId];
            blogCommentQuery = mysql.format(blogCommentQuery, table);

            connection.query(blogCommentQuery, function(error, results){
                if(error)throw error;
            })
                
            return res.json(results);   
        })
    })

    //Update comment
    blogRoutes.put('/comments', function(req,res){
        var query = "UPDATE comments SET body = ?, modified_on = ? WHERE id = ?";
        var table = [req.body.body, new Date().toJSON().slice(0, 19).replace('T', ' '), req.body.id];
        query = mysql.format(query, table);

        connection.query(query, function(error, results){
            if(error) throw error;
            return res.json(results);   
        })
    })

    //Delete comment
    blogRoutes.delete('/comments/:id', function(req, res){
        var commentQuery = "DELETE FROM comments WHERE id = ?";
        var blogCommentQuery = "DELETE FROM blogcomments WHERE comment_id = ?";
        let id = req.params.id;

        if(!id){
            res.status(400).send({error:true, message:"No id was found"});
        }

        connection.query(blogCommentQuery, id, function(error, results){
            if(error) throw error;
            connection.query(commentQuery, id, function(error, results){
                if(error)throw error;
                
                return res.json(results);
            })
        })

        
    })

    //Get all blogcomments by blog
    blogRoutes.get('/blogcomments/:id', function(req, res){
        var query = "SELECT * FROM blogcomments WHERE blog_id = ?";
        var id = req.params.id;

        connection.query(query, id, function(error, results){
            if(error) throw error;
            return res.json(results);        
        })
    })


    return blogRoutes;
}

module.exports = routes;
