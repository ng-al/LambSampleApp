/* Copyright (c) 2015 Alvin Pivowar */
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
                return $http.post("/api/users", user);
            }

            function deleteUser(id) {
                return $http.delete("/api/users/" + id);
            }

            function getAllUsers() {
                return $http.get("/api/users");
            }

            function getUser(criteria) {
                return $http.get("/api/users/" + criteria);
            }

            function init() {
                lambSocks.registerTransform(/USER_CREATE/, function(sockMessage) {
                    var id = sockMessage.receivedData;
                    return $q(function(accept, reject) {
                        getUser(id).then(function(data) {
                            accept({
                                topic: "users.create." + id,
                                data: data.data
                            });
                        });
                    });
                });

                lambSocks.registerTransform(/USER_DELETE/, function(sockMessage) {
                    var id = sockMessage.receivedData;
                    return {
                        topic: "users.delete." + id,
                        data: id
                    };
                });

                lambSocks.registerTransform(/USER_UPDATE/, function(sockMessage) {
                    var id = sockMessage.receivedData;
                    return $q(function(accept, reject) {
                        getUser(id).then(function(data) {
                            accept({
                                topic: "users.update." + id,
                                data: data.data
                            });
                        });
                    });
                });
            }

            function updateUser(user) {
                return $http.put("/api/users/" + user.id, user);
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