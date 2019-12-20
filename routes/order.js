const express = require('express');
var connection = require('../db');
const mysql = require('mysql');

function routes(){
    var orderRoutes = express.Router();

    //Get all orders
    orderRoutes.get('/orders', function(req, res){
        var query = "SELECT * FROM orders";
        let getItems = req.query.getItems;

        connection.query(query, function(error, orderResults){
            if(error)throw error;
            query = "SELECT id, username, first_name, last_name FROM users";
            connection.query(query, function(error, userResults){
                if (error) throw error;
                for (var j = 0; j < orderResults.length; j++) {
                    orderResults[j].user = userResults.find(u => u.id === orderResults[j].user_id);
                }
                if (getItems ==='true') {
                    query = "SELECT oi.order_id as id, oi.quantity, p.name, p.price, p.id as product_id FROM orderitems oi INNER JOIN products p ON oi.product_id = p.id"
                    connection.query(query, function (error, orderItemResults) {
                        if (error) throw error;
                        for (var i = 0; i < orderResults.length; i++) {
                            var items = [];
                            orderResults[i].items = [];
                            let orderId = orderResults[i].id;     
                            items = orderItemResults.filter(i => i.id === orderId);
                            items.forEach(item => {
                                var data = {
                                    product: {
                                        id: item.product_id,
                                        name: item.name,
                                        price: item.price
                                    },
                                    quantity: item.quantity
                                }
                                orderResults[i].items.push(data);
                            })
                        }
                        return res.json(orderResults);
                    })
                } else {
                    return res.json(orderResults);
                }
            })             
        })
    })

    //Get order by id
    orderRoutes.get('/orders/:id', function(req, res){
        var query = "SELECT * FROM orders WHERE id = ?";
        let id = req.params.id;
        let getItems = req.query.getItems;

        if(!id){
            return res.status(400).send({error:true, message:"No id available to get order"});
        }

        connection.query(query, id, function(error, orderResults){
            if(error) throw error;
            query = "SELECT id, username, first_name, last_name FROM users WHERE id = ?";
            let userId = orderResults[0].user_id;
            connection.query(query, userId, function(error, userResults){
                if(error) throw error;
                orderResults[0].user = userResults[0];
                if(getItems ==='true'){
                    query = "SELECT oi.order_id as id, oi.quantity, p.name, p.price, p.id as product_id FROM orderitems oi INNER JOIN products p ON oi.product_id = p.id"
                    connection.query(query, orderResults[0].id, function(error, orderItemResults){
                        if(error) throw error;
                        orderResults[0].items = [];                       
                        for(var i = 0; i < orderItemResults.length; i++){
                            var data = 
                            { 
                                product : {
                                    id: orderItemResults[i].id, 
                                    name: orderItemResults[i].name, 
                                    price: orderItemResults[i]
                                },
                                quantity: orderItemResults[i].quantity
                            }
                            orderResults[0].items.push(data);
                        }
                        return res.json(orderResults[0]);
                    })
                }else{
                    return res.json(orderResults[0]);
                }
            })
        })
    })

    //Add order
    orderRoutes.post('/orders', function(req, res){
        var query = "INSERT INTO orders SET ?";
        let order = req.body.order;
        let orderItems = req.body.orderItems;
        
        if(!order){
            return res.status(400).send({error:true, message:"Issue getting order from the body"});
        }

        connection.query(query, order, function(error, orderResults){
            if(error) throw error;
            query = "INSERT INTO orderitems (product_id, quantity, order_id) VALUES ?"
            let id = orderResults.insertId;
            var items = [];
            orderItems.forEach(i => {
                i.order_id = id;
                items.push(Object.values(i));
            })
            connection.query(query, [items], function(error, orderItemResults){
                if(error) throw error;
                return res.json({error: false, results: orderResults})
            })
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
    orderRoutes.delete('/orders', function(req, res){
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
        let getProduct = req.params.getProduct;

        connection.query(query, function(error, orderResults){
            if(error) throw error;
            if(getProduct){
                query = "SELECT * FROM products";
                connection.query(query, function(error, productResults){
                    if(error) throw error;
                    orderResults.foreach(o => {
                        o.product = productResults.find(p => p.id === o.prod_id);
                    })
                    return res.json(orderResults);
                })
            }else{
                return res.json({error:false, data:orderResults, message:"Successfully obtained all orderitems"});
            }
        })
    })

    //Get orderitem by id
    orderRoutes.get('/orderitems/:id', function(req, res){
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

    //Get orderitems by product
    orderRoutes.get('/orderitems/product/:id', function(req,res){
        var query = "SELECT o.created_on, oi.quantity FROM products p, orders o, orderitems oi WHERE p.id = ? AND p.id = oi.product_id AND oi.order_id = o.id"
        let id = req.params.id;
        if(!id){
            return res.status(400).send({error:true, message:"Product data was not recieved"});
        }

        connection.query(query, id, function(error, results){
            if(error) throw error;
            return res.json(results);
        })
    })

    //Add orderitem
    orderRoutes.post('/orderitems', function(req, res){
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
    orderRoutes.put('/orderitems', function(req, res){
        var query = "UPDATE orderitems SET product_id = ?, order_id = ?, quantity = ? WHERE id = ?";
        var table = [req.body.orderitem.product_id, req.body.orderitem.order_id, req.body.orderitem.quantity, req.body.orderitem.id];
        query = mysql.format(query, table);

        connection.query(query, function(error, results){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully updated orderitem"});
        })
    })

    //Delete orderitem
    orderRoutes.delete('/orderitems', function(req, res){
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