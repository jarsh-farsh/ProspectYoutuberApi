const express = require('express');
var connection = require('../db');
const mysql = require('mysql');

const multer = require('multer');
var imageDir = './images/';
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, imageDir)
    },
    filename: function( req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({storage: storage});

function routes(){
    var productRoutes = express.Router();

    //Get all products
    productRoutes.get('/products', function(req, res){
        var query = "SELECT * FROM products";
        let getImages = req.query.getImages;

        connection.query(query, function(error, prodResults){
            if(error) throw error;
            if(getImages === 'true'){
                query = "SELECT * FROM productImage"
                connection.query(query, function(error, imgResults){
                    if(error) throw error;
                    prodResults.forEach(p => {
                        var urls = imgResults.filter(i => i.prod_id === p.id).map(function(i){
                            if(i) return i.url;
                        });
                        if(urls){
                            p.image_url = urls;
                        }
                    })
                    return res.send(prodResults);
                })
            }else{
                return res.send(prodResults);
            }
            
        })
    })

    //Get popular products
    productRoutes.get('/productspopular', function(req,res){
        var query = "SELECT * FROM products ORDER BY quantity_sold DESC LIMIT 3";

        connection.query(query, function(error, prodResults){
            if(error) throw error;
            query = "SELECT * FROM productimage WHERE prod_id IN (?)";
            var ids = [];
            prodResults.forEach(p => {
                ids.push(p.id);
            });
            connection.query(query, [ids], function(error, imageResults){
                if(error) throw error;
                imageResults.forEach(i => {
                    prodResults.forEach(p => {
                        if(i.prod_id === p.id) {
                            if(!p.url) p.image_url = [];
                            p.image_url.push(i.url);
                        }
                    })
                })
                return res.json(prodResults);
            })
            
        })
    })

    //Get product by id
    productRoutes.get('/products/:id', function(req, res){
        var query = "SELECT * FROM products WHERE id = ?";
        let id = req.params.id;
        let getImages = req.query.getImages;

        connection.query(query, id, function(error, prodResults){
            if(error) throw error;
            if(getImages === 'true'){
                query = "SELECT * FROM productImage WHERE prod_id = ?"
                connection.query(query, id, function(error, imgResults){
                    if(error) throw error;
                    prodResults.forEach(p => {
                        var urls = imgResults.filter(i => i.prod_id === p.id).map(function(i){
                            if(i) return i.url;
                        });
                        if(urls){
                            p.image_url = urls;
                        }
                        console.log(urls)
                    })
                    return res.send(prodResults[0]);
                })
            }else{
                return res.send(prodResults[0]);
            }
            
        })
    })

    //Add product
    productRoutes.post('/products', function(req, res){
        var query = "INSERT INTO products SET ?";
        let product = req.body.product;
        let imageUrls = Object.values(req.body.image_urls);
        let tags = Object.values(req.body.tags);

        if(!product) return res.status(400).send({error:true, message:"No product data"});

        connection.query(query, product, function(error, results){
            if(error) throw error;
            let prod_id = results.insertId;
            if(imageUrls.length === 0 && tags.length === 0){
                return res.send({error:false, data:results});
            }
            if (imageUrls.length > 0) {
                imageQuery = "INSERT INTO productimage (prod_id, url) VALUES ?"
                var imageData = [];
                imageUrls.forEach(u => {
                    imageData.push([prod_id, u]);
                })
                connection.query(imageQuery, [imageData], function (error, results) {
                    if (error) throw error;
                    console.log(results);
                })
            }
            if(tags.length > 0){
                tagQuery = "INSERT INTO producttags (prod_id, tag_id) VALUES ?"
                tagData = [];
                tags.forEach(t => {
                    tagData.push([prod_id, t]);
                })
                connection.query(tagQuery, [tagData], function (error, results) {
                    if (error) throw error;
                    console.log(results);
                })
            }

            return res.json({error: false, data:results});
        })
    })

    //Update product
    productRoutes.put('/products', function(req, res){
        var query = "UPDATE products SET name = ?, price = ?, description = ?, quantity_in_stock = ?, quantity_sold = ? WHERE id = ?";
        var table = [req.body.product.name, req.body.product.price, req.body.product.description, req.body.product.quantity_in_stock, req.body.product.quantity_sold, req.body.product.id];
        query = mysql.format(query, table);

        console.log(query);
        connection.query(query, function(error, results){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully updated product"});
        })


    })

    //Delete product
    productRoutes.delete('/product', function(req, res){
        var query = "DELETE FROM products WHERE id = ?";
        let id = req.body.product.id;

        if(!id){
            res.status(400).send({error:true, message:"Product id not passed to query"});
        }

        connection.query(query, id, function(error, results){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully deleted product"});
        })
    })

    //Get product images by product id
    productRoutes.get('/images/:id', function(req, res){
        let id = req.params.id;
        if(!id){
            return res.status(400).send({error:true, message:"No product id was submitted"});
        }
        var query = "SELECT * FROM productimage WHERE prod_id = ?";
        connection.query(query, id, function(error, results){
            if(error) throw error;
            return res.json(results);
        })

    })

    //Add product image
    productRoutes.post('/images', upload.array("uploads", 12), function (req, res) {
        if (!req.files) {
            console.log("No file recieved");
            return res.send({ error: true })
        }
        res.json({ error: false, imagesAdded: req.files });
    })

    //Get tags
    productRoutes.get('/tags', function(req, res){
        var query = "SELECT tagcategory.name as type, tags.id, tags.name FROM tags INNER JOIN tagcategory ON tags.category_id=tagcategory.id";

        connection.query(query, function(error, results){
            if(error)throw error;
            return res.json(results);
        })
    })

    //Get producttags
    productRoutes.get('/producttags', function(req, res){
        var query = "SELECT * FROM producttags";

        connection.query(query, function(error, results){
            if(error) throw error;
            return res.json(results);
        })
    })

    return productRoutes;
}

module.exports = routes;