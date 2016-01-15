/* Copyright (c) 2015 Alvin Pivowar */
var express = require("express");
var fs = require("fs");
var HttpStatusCodes = require("http-status-codes");
var router = express.Router();
var users = [];
var uuid = require('node-uuid');

var USER_FILE = "users.txt";

var USERS = [
    {firstName: "Alvin", lastName: "Pivowar", email: "alvin.pivowar@gmail.com"},
    {firstName: "Bruce", lastName: "Wilson", email: "bruce.wilson@neovant.com"},
    {firstName: "Stephen", lastName: "Rogers", email: "sarogers@gorgelogic.com"}
];


/*
 **  Middleware
 */

function buildAndValidateUser(firstName, lastName, email, id) {
    if (!lastName) return null;
    if (!email) return null;
    if (email.indexOf('@') === -1 || email.indexOf('.') === -1) return null;

    return {
        firstName: firstName,
        lastName: lastName,
        email: email,
        id: id
    };
}

function commitUserData() {
    var ws = fs.createWriteStream(USER_FILE);
    ws.write(JSON.stringify(users));
    ws.end();
}

function createUser(user) {
    user.id = uuid.v4();
    users.push(user);
    commitUserData();
}

function deleteUser(id) {
    var i;
    var result = [];
    var user;
    var wasFound = false;

    for (i = 0; i < users.length; ++i) {
        user = users[i];
        if (user.id !== id)
            result.push(user);
        else
            wasFound = true;
    }

    if (wasFound) {
        users = result;
        commitUserData();
    }
}

function getAllUsers() {
    return users;
}

function getUserByEmail(email) {
    for (var i = 0; i < users.length; ++i) {
        if (users[i].email === email) {
            return users[i];
        }
    }

    return null;
}

function getUserById(id) {
    for (var i = 0; i < users.length; ++i) {
        if (users[i].id === id) {
            return users[i];
        }
    }

    return null;
}

function initializeUserData() {
    fs.exists(USER_FILE, function (exists) {
        var i;

        if (exists) {
            fs.readFile(USER_FILE, function (err, data) {
                users = JSON.parse(data);
            });
        } else {
            for (i = 0; i < USERS.length; ++i) {
                USERS[i].id = uuid.v4();
            }
            users = USERS;
            commitUserData();
        }
    });
}

function updateUser(updatedUser) {
    var i;
    var user;

    for (i = 0; i < users.length; ++i) {
        user = users[i];
        if (updatedUser.id === user.id) {
            user.firstName = updatedUser.firstName;
            user.lastName = updatedUser.lastName;
            user.email = updatedUser.email;
            commitUserData();
            return;
        }
    }
}

module.exports = function (io) {

    initializeUserData();

    /*
     ** Endpoints
     */

// DELETE /api/users/{id}
    router.delete("/users/:id", function (req, res, next) {
        var user = getUserById(req.params.id);
        if (user) {
            deleteUser(user.id);

            io.sockets.emit("BLEAT", {topic: "USER_DELETE", data: user.id});

            res.set("x-Message", "Successfully deleted User " + req.params.id + ".");
            res.statusCode = HttpStatusCodes.NO_CONTENT;
            res.send();
            return;
        }

        next();
    });

// GET /api/users
    router.get("/users", function (req, res, next) {
        res.send(getAllUsers());
    });

// GET /api/users/{id or email}
    router.get('/users/:id', function (req, res, next) {
        var idOrEmail = req.params.id;
        var user = (idOrEmail.indexOf('@') !== -1)
            ? getUserByEmail(idOrEmail)
            : getUserById(idOrEmail);

        if (user) {
            res.send(user);
            return;
        }

        // Return 404 NOT FOUND
        next();
    });

// POST /api/users
    router.post("/users", function (req, res, next) {
        var user;

        if (req.body.id) {
            res.set("x-Message", "POST failed: ID in JSON conflicts with URI.");
            res.statusCode = HttpStatusCodes.CONFLICT;
            res.send();
            return;
        }

        user = buildAndValidateUser(req.body.firstName, req.body.lastName, req.body.email);
        if (!user || getUserByEmail(user.email)) {
            // Either validation has failed or there is another user with the same email.
            res.set("x-Message", user ? "POST failed: Email not available." : "POST failed: lastname or email invalid.");
            res.statusCode = HttpStatusCodes.BAD_REQUEST;
            res.send();
            return;
        }

        createUser(user);

        io.sockets.emit("BLEAT", {topic: "USER_CREATE", data: user.id});

        res.set({
                "x-Message": "Successfully created User " + user.id + ".",
                "Location": "/api/users/" + user.id
            }
        );
        res.statusCode = HttpStatusCodes.CREATED;
        res.send(user);
    });

// PUT /api/users/{id}
    router.put("/users/:id", function (req, res, next) {
        var id = req.params.id;
        var otherUser;
        var user;

        user = getUserById(id);
        if (!user) {
            // Return 404 NOT FOUND
            next();
            return;
        }

        user = buildAndValidateUser(req.body.firstName, req.body.lastName, req.body.email, id);
        if (!user) {
            res.set("x-Message", "PUT failed: lastname or email is invalid.");
            res.statusCode = HttpStatusCodes.BAD_REQUEST;
            res.send();
            return;
        }

        if (req.params.id !== user.id) {
            // The ID in the URI does not match the id in the payload.
            res.set("x-Message", "PUT failed: ID in JSON conflicts with URI.");
            res.statusCode = HttpStatusCodes.CONFLICT;
            res.send();
            return;
        }

        // Ensure that the  caller has not changed the email address to match a different user.
        otherUser = getUserByEmail(user.email);
        if (otherUser && otherUser.id !== user.id) {
            res.set("x-Message", "PUT failed: Email is not available.");
            res.statusCode = HttpStatusCodes.BAD_REQUEST;
            res.send();
            return;
        }

        updateUser(user);

        io.sockets.emit("BLEAT", {topic: "USER_UPDATE", data: user.id});

        res.set({
            "x-Message": "Successfully updated User " + user.id,
            "Location": "/api/users/" + id
        });
        res.send(getUserById(id));
    });


    return router;
};