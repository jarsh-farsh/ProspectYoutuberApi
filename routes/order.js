const express = require('express');
var connection = require('../db');
const mysql = require('mysql');

function routes(){
    var orderRoutes = express.Router();

    //Get all orders
    orderRoutes.get('/orders', function(req, res){
        var query = "SELECT * FROM orders";
        connection.query(query, function(error, results){
            if(error)throw error;
            return res.json({error:false, data:results, message:"Successfully obtained all orders"});
        })
    })

    //Get order by id
    orderRoutes.get('/order/:id', function(req, res){
        var query = "SELECT * FROM orders WHERE id = ?";
        let id = req.params.id;

        if(!id){
            return res.status(400).send({error:true, message:"No id available to get order"});
        }

        connection.query(query, id, function(error, requests){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully got the order"});
        })
    })

    //Add order
    orderRoutes.post('/order', function(req, res){
        var query = "INSERT INTO orders SET ?";
        let order = req.body.order;

        if(!order){
            return res.status(400).send({error:true, message:"Issue getting order from the body"});
        }

        connection.query(query, order, function(error, results){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully added the order"});
        })
    })

    //Update order
    orderRoutes.put('/orders', function(req, res){
        var query = "UPDATE orders SET total_cost = ? WHERE id = 0";
        var table = [req.body.order.total_cost, req.body.order.id];
        query = mysql.format(query, table);

        connection.query(query, function(error, results){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully updated order"});
        })
    })

    //Delete order
    orderRoutes.delete('/order', function(req, res){
        var query = "DELETE FROM orders WHERE id = ?";
        let id = req.body.order.id;

        if(!id){
            return res.status(400),send({error:true, message:"Issue getting order id from the body"});
        }

        connection.query(query, id, function(error, results){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully deleted order"});
        })
    })

    //Get all orderitems
    orderRoutes.get('/orderitems', function(req, res){
        var query = "SELECT * FROM orderitems"

        connection.query(query, function(error, results){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully obtained all orderitems"});
        })
    })

    //Get orderitem by id
    orderRoutes.get('/orderitem/:id', function(req, res){
        var query = "SELECT * FROM orderitems WHERE id = ?";
        let id = req.params.id;

        if(!id){
            return res.status(400).send({error:true, message:"Issue getting orderitem id from route"});
        }

        connection.query(query, id, function(error, results){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully obtain orderitem by id"});
        })
    })

    //Add orderitem
    orderRoutes.post('/orderitem', function(req, res){
        var query = "INSERT INTO orderitems SET ?";
        var orderItem = req.body.orderitem;
    
        if(!orderItem){
            return res.status(400).send({error:true, message:"Issue getting orderitem from body"});
        }

        connection.query(query, orderItem, function(error, results){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully added orderitem"});
        })
    })

    //Update orderitem
    orderRoutes.put('/orderitem', function(req, res){
        var query = "UPDATE orderitems SET product_id = ?, order_id = ?, quantity = ? WHERE id = ?";
        var table = [req.body.orderitem.product_id, req.body.orderitem.order_id, req.body.orderitem.quantity, req.body.orderitem.id];
        query = mysql.format(query, table);

        connection.query(query, function(error, results){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully updated orderitem"});
        })
    })

    //Delete orderitem
    orderRoutes.delete('/orderitem', function(req, res){
        var query = "DELETE FROM orderitems WHERE id = ?";
        let id = req.body.orderitem.id;

        if(!id){
            return res.status(400).send({error:true, message:"Issue getting id from body for orderitem delete"});
        }

        connection.query(query, id, function(error, results){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully deleted orderitem"});
        })
    })

    return orderRoutes;
}

module.exports = routes;