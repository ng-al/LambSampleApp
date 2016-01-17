// Copyright (c) Alvin Pivowar 2015, 2016

(function(){
    "use strict";

    var SERVICE_NAME = "userService3";

    angular
        .module("LambSample")
        .factory(SERVICE_NAME,
        ["$http", "$q", "$rootScope", "lambSocks",
        function($http, $q, $rootScope, lambSocks) {

            init();

            function createUser(user) {
                return $q(function(accept, reject) {
                    $http.post("/api/users", user).then(function(response) {
                        if (response.status === 201)
                            accept(response.data);
                        else
                            reject(response.status);
                    });
                });
            }

            function deleteUser(uuid) {
                return $http.delete("/api/users/" + uuid);
            }

            function getAllUsers() {
                return $http.get("/api/users");
            }

            function getUser(criteria) {
                return $http.get("/api/users/" + criteria);
            }

            function init() {
                lambSocks.registerTransform(/USER_CREATE/, function(sockMessage) {
                    var uuid = sockMessage.receivedData;
                    return $q(function(accept, reject) {
                        getUser(uuid).then(function(data) {
                            accept({
                                topic: "users.create." + uuid,
                                data: data.data
                            });
                        });
                    });
                });

                lambSocks.registerTransform(/USER_DELETE/, function(sockMessage) {
                    var uuid = sockMessage.receivedData;
                    return {
                        topic: "users.delete." + uuid,
                        data: uuid
                    };
                });

                lambSocks.registerTransform(/USER_UPDATE/, function(sockMessage) {
                    var uuid = sockMessage.receivedData;
                    return $q(function(accept, reject) {
                        getUser(uuid).then(function(data) {
                            accept({
                                topic: "users.update." + uuid,
                                data: data.data
                            });
                        });
                    });
                });
            }

            function updateUser(user) {
                return $q(function(accept, reject) {
                    $http.put("/api/users/" + user.uuid, user).then(function(response) {
                        if (response.status === 200)
                            accept(response.data);
                        else
                            reject(response.status);
                    });
                });
            }

            return {
                createUser: createUser,
                deleteUser: deleteUser,
                getAllUsers: getAllUsers,
                getUser: getUser,
                updateUser: updateUser
            };
        }]);
})();