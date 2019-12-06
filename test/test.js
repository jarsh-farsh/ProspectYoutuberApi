var assert = require('assert');

//Test to see if mysql connection is valid
const connection = require('../db');

describe('DB connection', function () {
    it('should connect to db successfully', function (done) {
        connection.getConnection(function (err) {
            if (err) done(err);
            setImmediate(done);
        })
    })
});



