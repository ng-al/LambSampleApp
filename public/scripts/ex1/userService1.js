// Copyright (c) Alvin Pivowar 2015, 2016

(function(){
    "use strict";

    angular
        .module("LambSample")
        .factory("userService1",
        ["$http", "$q",
        function($http, $q) {
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