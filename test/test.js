var assert = require('assert');

//Dummy test to try travis.ci

describe('Test, test', function(){
    it('Should pass considering its a dummy test', function(){
        assert('Test!', 'Test!');
    })
})

//Test to see if mysql connection is valid
//Will only work when db is connected to actual db, so do not
//try when in developement otherwise it will only work on local machine
if(process.env.NODE_ENV === "Production"){
    const connection = require('../db');

    describe('DB connection', function () {
        it('should connect to db successfully', function (done) {
            connection.getConnection(function (err) {
                if (err) done(err);
                setImmediate(done);
            })
        })
    });
}




