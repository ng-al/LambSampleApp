// Copyright (c) 2015, 2016 Alvin Pivowar

var express = require("express");
var HttpStatusCodes = require("http-status-codes");
var router = express.Router();

var userRepository = require("../db/userRepository");

function buildAndValidateUser(firstName, lastName, email, uuid) {
    if (!lastName) return null;
    if (!email) return null;
    if (email.indexOf('@') === -1 || email.indexOf('.') === -1) return null;

    return {
        uuid: uuid,
        firstName: firstName,
        lastName: lastName,
        email: email
    };
}

function logDbError(err) {
    console.log(err);
}

module.exports = function (io) {

    // DELETE /api/users/{uuid}
    router.delete("/users/:uuid", function (req, res, next) {
        userRepository.getUserByCriteria(req.params.uuid).then(function(user) {
            if (!user) {
                next();     // 404
                return;
            }

            userRepository.deleteUser(user.uuid).then(function() {
                io.sockets.emit("BLEAT", { topic: "USER_DELETE", data: user.uuid });

                res.set("x-Message", "Successfully deleted User " + req.params.uuid + ".");
                res.statusCode = HttpStatusCodes.NO_CONTENT;
                res.send();
            }, logDbError);
        }, logDbError);
    });

    // GET /api/users
    router.get("/users", function (req, res, next) {
        userRepository.getAllUsers().then(function(users) {
            res.send(users);
        }, logDbError);
    });

    // GET /api/users/{uuid or email}
    router.get('/users/:uuid', function (req, res, next) {
        var criteria = req.params.uuid;
        userRepository.getUserByCriteria(criteria).then(function(user) {
            if (!user) {
                next();     // 404
                return;
            }

            res.send(user);
        }, logDbError);
    });

    // POST /api/users
    router.post("/users", function (req, res, next) {
        var newUser;

        if (req.body.uuid) {
            res.set("x-Message", "POST failed: uuid in JSON conflicts with URI.");
            res.statusCode = HttpStatusCodes.CONFLICT;
            res.send();
            return;
        }

        newUser = buildAndValidateUser(req.body.firstName, req.body.lastName, req.body.email);
        if (!newUser) {
            res.set("x-Message", "POST failed: lastName or email invalid.");
            res.statusCode = HttpStatusCodes.BAD_REQUEST;
            res.send();
            return;
        }

        userRepository.getUserByCriteria(newUser.email).then(function(user) {
            if (user) {
                res.set("x-Message", "POST failed: Email not available.");
                res.statusCode = HttpStatusCodes.BAD_REQUEST;
                res.send();
                return;
            }

            userRepository.createUser(newUser.firstName, newUser.lastName, newUser.email).then(function(uuid) {
                io.sockets.emit("BLEAT", { topic: "USER_CREATE", data: uuid });

                res.set({
                        "x-Message": "Successfully created User " + uuid + ".",
                        "Location": "/api/users/" + uuid
                    }
                );
                res.statusCode = HttpStatusCodes.CREATED;
                newUser.uuid = uuid;
                res.send(newUser);
            }, logDbError);
        }, logDbError);
    });

    // PUT /api/users/{uuid}
    router.put("/users/:uuid", function (req, res, next) {
        var uuid = req.params.uuid;
        var otherUser;
        var user;

        userRepository.getUserByCriteria(uuid).then(function(user) {
            if (!user) {
                next();     // 404
                return;
            }

            user = buildAndValidateUser(req.body.firstName, req.body.lastName, req.body.email, uuid);
            if (!user) {
                res.set("x-Message", "PUT failed: lastName or email is invalid.");
                res.statusCode = HttpStatusCodes.BAD_REQUEST;
                res.send();
                return;
            }

            if (req.params.uuid !== user.uuid) {
                // The uuid in the URI does not match the uuid in the payload.
                res.set("x-Message", "PUT failed: uuid in JSON conflicts with URI.");
                res.statusCode = HttpStatusCodes.CONFLICT;
                res.send();
                return;
            }

            // Ensure that the  caller has not changed the email address to match a different user.
            userRepository.getUserByCriteria(user.email).then(function(otherUser) {
                if (otherUser && otherUser.uuid !== user.uuid) {
                    res.set("x-Message", "PUT failed: Email is not available.");
                    res.statusCode = HttpStatusCodes.BAD_REQUEST;
                    res.send();
                    return;
                }

                userRepository.updateUser(user.uuid, user.firstName, user.lastName, user.email).then(function() {
                    io.sockets.emit("BLEAT", { topic: "USER_UPDATE", data: user.uuid });

                    res.set({
                        "x-Message": "Successfully updated User " + user.uuid,
                        "Location": "/api/users/" + uuid
                    });
                    res.send(user);
                }, logDbError);
            }, logDbError);
        }, logDbError);
    });


    return router;
};