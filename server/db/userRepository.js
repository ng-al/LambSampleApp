// Copyright (c) 2015, 2016 Alvin Pivowar

var Promise = require("promise");
var sqlite3 = require("sqlite3").verbose();
var uuidGenerator = require("node-uuid");

var userInitialization = require("./userInitialization");

var userRepository = {
    db: new sqlite3.Database("./server/db/lambSample.db")
};

userRepository.createUser = function(firstName, lastName, email) {
    return new Promise(function(accept, reject) {
        var uuid = uuidGenerator.v4();
        userRepository.db.run("insert into user (uuid, firstName, lastName, email) values ($uuid, $firstName, $lastName, $email)", {
            $uuid: uuid,
            $firstName: firstName,
            $lastName: lastName,
            $email: email
        }, function(err, row) {
            if (err)
                reject(err);
            else
                accept(uuid);
        });
    });
};

userRepository.deleteUser = function(uuid) {
    return new Promise(function(accept, reject) {
        userRepository.db.run("delete from user where uuid = ?", uuid, function(err, row) {
            if (err)
                reject(err);
            else
                accept(true);
        });
    });
};

userRepository.getAllUsers = function() {
    return new Promise(function(accept, reject) {
        userRepository.db.all("select uuid, firstName, lastName, email from user", function(err, rows) {
            if (err)
                reject(err);
            else
                accept(rows);
        });
    });
};

userRepository.getNumberOfUsers = function() {
    return new Promise(function(accept, reject) {
        userRepository.db.get("select count(*) from user", function(err, row) {
            accept(row["count(*)"]);
        });
    });
};

userRepository.getUserByCriteria = function(criteria) {
    return new Promise(function(accept, reject) {
        userRepository.db.get("select uuid, firstName, lastName, email from user where uuid = $criteria or email = $criteria", {
            $criteria: criteria
        }, function(err, row) {
            if (err)
                reject(err);
            else
                accept(row);
        });
    });
};

userRepository.updateUser = function(uuid, firstName, lastName, email) {
    return new Promise(function(accept, reject) {
        userRepository.db.run("update user set firstName = $firstName, lastName = $lastName, email = $email where uuid = $uuid", {
            $uuid: uuid,
            $firstName: firstName,
            $lastName: lastName,
            $email: email
        }, function(err, row) {
            if (err)
                reject(err);
            else
                accept(true);
        });
    });
};

userInitialization.initializeUsers(userRepository);
module.exports = userRepository;
