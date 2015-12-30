/* Copyright (c) 2015 Alvin Pivowar */
(function(){
    "use strict";

    var SERVICE_NAME = "userService2";

    angular
        .module("LambSample")
        .factory(SERVICE_NAME,
        ["$http", "$rootScope", "Lamb",
        function($http, $rootScope, Lamb) {
            var bus = new Lamb(SERVICE_NAME, $rootScope);

            function createUser(user) {
                return $http.post("/api/users", user).success(function(user) {
                    bus.publish("users.create." + user.id, user);
                });
            }

            function deleteUser(id) {
                return $http.delete("/api/users/" + id).success(function() {
                    bus.publish("users.delete." + id, id);
                });
            }

            function getAllUsers() {
                return $http.get("/api/users");
            }

            function getUser(criteria) {
                return $http.get("/api/users/" + criteria);
            }

            function updateUser(user) {
                return $http.put("/api/users/" + user.id, user).success(function(user) {
                    bus.publish("users.update." + user.id, user);
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