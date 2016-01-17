// Copyright (c) Alvin Pivowar 2015, 2016

(function() {
    "use strict";

    var CONTROLLER_NAME = "userCtrl2";

    angular
        .module("LambSample")
        .controller(CONTROLLER_NAME,
        ["$scope", "Lamb", "userService2",
        function($scope, Lamb, userService2) {
            var bus = new Lamb(CONTROLLER_NAME, $scope);

            var vm = this;
            vm.editUser = {};
            vm.users = [];

            vm.cancelEdit = cancelEdit;
            vm.create = create;
            vm.add = add;
            vm.delete = deleteOp;
            vm.edit = edit;
            vm.update = update;

            init();

            function add() {
                vm.editUser = { uuid: "new"};
            }

            function cancelEdit() {
                vm.editUser = {};
            }

            function create(newUser) {
                delete newUser.uuid;
                userService2.createUser(newUser);
                cancelEdit();
            }

            function deleteOp(uuid) {
                userService2.deleteUser(uuid);
            }

            function edit(uuid) {
                angular.forEach(vm.users, function(user) {
                    if (user.uuid === uuid) {
                        angular.extend(vm.editUser, user);
                    }
                });
            }

            function init() {
                userService2.getAllUsers().then(function(data) {
                    vm.users = data.data;
                });

                bus.subscribe("users.create.*", function(createdUser) {
                    vm.users.push(createdUser);
                });

                bus.subscribe("users.update.*", function(updatedUser) {
                    angular.forEach(vm.users, function(user) {
                        if (user.uuid === updatedUser.uuid) {
                            angular.extend(user, updatedUser);
                        }
                    });
                });

                bus.subscribe("users.delete.*", function(uuid) {
                    var updatedUserList = [];
                    angular.forEach(vm.users, function(user) {
                        if (user.uuid !== uuid)
                            updatedUserList.push(user);
                    });
                    vm.users = updatedUserList;
                });
            }

            function update(updatedUser) {
                userService2.updateUser(updatedUser);
                cancelEdit();
            }
        }]);
})();