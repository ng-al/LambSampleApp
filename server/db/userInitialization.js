// Copyright (c) 2015, 2016 Alvin Pivowar

var SQL_CREATE_TABLE = "create table if not exists user (id integer primary key asc, uuid text, firstName text, lastName text, email text)";
var SQL_INSERT_USER = "insert into user (uuid, firstName, lastName, email) values ($uuid, $firstName, $lastName, $email)";

var USERS = [
    {uuid: "edae3d45-03cf-41c6-8291-aa2fc23baded", firstName: "Alvin", lastName: "Pivowar", email: "alvin.pivowar@gmail.com"},
    {uuid: "36063f52-3ea3-4b36-afd2-9e5394a819f2", firstName: "Bruce", lastName: "Wilson", email: "bruce.wilson@neovant.com"},
    {uuid: "b0aeb514-c0d9-4302-8208-bead0b1dbf43", firstName: "Stephen", lastName: "Rogers", email: "sarogers@gorgelogic.com"}
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
                            $uuid: user.uuid,
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
