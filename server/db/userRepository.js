// Copyright (c) 2015, 2016 Alvin Pivowar

var DB_PATH = "./server/db/lambSample.db";

var Sqlite3Helper = require("./sqlite3-helper");
var userInitialization = require("./userInitialization");
var uuidGenerator = require("node-uuid");

var helper = new Sqlite3Helper(DB_PATH);

userInitialization.initialize(helper);


module.exports = {
    createUser: function(firstName, lastName, email) {
        var sql = "insert into user (uuid, firstName, lastName, email) values ($uuid, $firstName, $lastName, $email)";
        var uuid = uuidGenerator.v4();

        return helper.run(sql, {
            $uuid: uuid,
            $firstName: firstName,
            $lastName: lastName,
            $email: email
        }, uuid);
    },

    deleteUser: function(uuid) {
        var sql = "delete from user where uuid = ?";
        return helper.run(sql, uuid, true);
    },

    getAllUsers: function() {
        var sql = "select uuid, firstName, lastName, email from user";
        return helper.all(sql);
    },

    getUserByCriteria: function(criteria) {
        var sql = "select uuid, firstName, lastName, email from user where uuid = $criteria or email = $criteria";
        return helper.get(sql, { $criteria: criteria });
    },

    updateUser: function(uuid, firstName, lastName, email) {
        var sql = "update user set firstName = $firstName, lastName = $lastName, email = $email where uuid = $uuid";
        return helper.run(sql, {
            $uuid: uuid,
            $firstName: firstName,
            $lastName: lastName,
            $email: email
        }, true);
    }
};

