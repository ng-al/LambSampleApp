// Copyright (c) 2015, 2016 Alvin Pivowar

var USERS = [
    {firstName: "Alvin", lastName: "Pivowar", email: "alvin.pivowar@gmail.com"},
    {firstName: "Bruce", lastName: "Wilson", email: "bruce.wilson@neovant.com"},
    {firstName: "Stephen", lastName: "Rogers", email: "sarogers@gorgelogic.com"}
];

var userInitialization = {};

userInitialization.initializeUsers = function(userRepository) {
    userRepository.db.serialize(function() {
        userRepository.db.run("create table if not exists user (id integer primary key asc, uuid text, firstName text, lastName text, email text)");

        userRepository.getNumberOfUsers().then(function(count) {
            var i;
            var user;

            if (count === 0) {
                for (i = 0; i < USERS.length; ++i) {
                    user = USERS[i];
                    userRepository.createUser(user.firstName, user.lastName, user.email);
                }
            }
        });
    });
};

module.exports = userInitialization;
