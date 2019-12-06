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

        connection.query(query, function(error, prodResults){
            if(error) throw error;
            query = "SELECT * FROM productImage"
            connection.query(query, function(error, imgResults){
                if(error) throw error;
                data = { products: prodResults, imageUrls: imgResults }
                return res.send(data);
            })
            
        })
    })

    //Get popular products
    productRoutes.get('/productspopular', function(req,res){
        var query = "SELECT * FROM products ORDER BY quantity_sold DESC LIMIT 3";

        connection.query(query, function(error, results){
            if(error) throw error;
            return res.json(results);
        })
    })

    //Get product by id
    productRoutes.get('/products/:id', function(req, res){
        var query = "SELECT * FROM products WHERE id = ?";
        let id = req.params.id;

        if(!id){
            res.status(400).send({error:true, message:"Issue obtaining id parameter"});
        }

        connection.query(query, id, function(error, prodResults){
            if(error) throw error;
            query = "SELECT * FROM productImage WHERE prod_id = ?"
            connection.query(query, id, function(error, imgResults){
                if(error) throw error
                var data = { product: prodResults[0], imageUrls: imgResults }
                console.log(data);
                return res.send(data);
            })
        })
    })

    //Add product
    productRoutes.post('/product', function(req, res){
        var query = "INSERT INTO products SET ?";
        let product = req.body.product;

        if(!product){
            res.status(400).send({error:true, message:"Product data was not passed to query"});
        }

        connection.query(query, product, function(error, results){
            if(error) throw error;
            return res.json({error:false, data:results, message:"Successfully added product"});
        })
    })

    //Add product image
    productRoutes.post('/images', upload.array("uploads", 12), function(req, res){
        if(!req.files){
            console.log("No file recieved");
            return res.send({error: true})
        }
        res.json({error: false, imagesAdded: req.files});
    })

    //Update product
    productRoutes.put('/product', function(req, res){
        var query = "UPDATE products SET product_code = ?, image_url = ?, name = ?, price = ?, description = ?, quantity_in_stock = ?, quantity_sold = ? WHERE id = ?";
        var table = [req.body.product.product_code, req.body.product.image_url, req.body.product.name, req.body.product.price, req.body.product.quantity_in_stock, req.body.product.quantity_sold, req.body.product.id];
        query = mysql.format(query, table);

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

    //Get tags
    productRoutes.get('/tags', function(req, res){
        var query = "SELECT tagcategory.name categoryname, tags.id tagid, tags.name tagname FROM tags INNER JOIN tagcategory ON tags.category_id=tagcategory.id";

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