// Copyright (c) Alvin Pivowar 2015, 2016

(function(){
    "use strict";

    var SERVICE_NAME = "userService2";

    angular
        .module("LambSample")
        .factory(SERVICE_NAME,
        ["$http", "$q", "$rootScope", "Lamb",
        function($http, $q, $rootScope, Lamb) {
            var bus = new Lamb(SERVICE_NAME, $rootScope);

            function createUser(user) {
                return $q(function(accept, reject) {
                    $http.post("/api/users", user).then(function(response) {
                        if (response.status === 201) {
                            accept(response.data);
                            bus.publish("users.create." + user.uuid, response.data);
                        } else
                            reject(response.status);
                    });
                });
            }

            function deleteUser(uuid) {
                return $http.delete("/api/users/" + uuid).success(function() {
                    bus.publish("users.delete." + uuid, uuid);
                });
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
                        if (response.status === 200) {
                            accept(response.data);
                            bus.publish("users.update." + user.uuid, response.data);
                        } else
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