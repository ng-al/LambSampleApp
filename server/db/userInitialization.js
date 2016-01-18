// Copyright (c) 2015, 2016 Alvin Pivowar

var SQL_CREATE_TABLE = "create table if not exists user (id integer primary key asc, uuid text, firstName text, lastName text, email text)";
var SQL_INSERT_USER = "insert into user (uuid, firstName, lastName, email) values ($uuid, $firstName, $lastName, $email)";

var Sqlite3Helper = require("./sqlite3-helper");

var USERS = [
    {firstName: "Alvin", lastName: "Pivowar", email: "alvin.pivowar@gmail.com"},
    {firstName: "Bruce", lastName: "Wilson", email: "bruce.wilson@neovant.com"},
    {firstName: "Stephen", lastName: "Rogers", email: "sarogers@gorgelogic.com"}
];

module.exports = {
    initialize: function(helper) {
        helper.db.serialize(function () {
            helper.run(SQL_CREATE_TABLE);
            helper.getRowCount("user").then(function(count) {
                var i;
                var user;

                if (count === 0) {
                    for (i = 0; i < USERS.length; ++i) {
                        user = USERS[i];
                        helper.run(SQL_INSERT_USER, {
                            $firstName: user.firstName,
                            $lastName: user.lastName,
                            $email: user.email
                        });
                    }
                }
            });
        });
    }
};
