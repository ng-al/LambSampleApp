// Copyright (c) Alvin Pivowar 2015, 2016

(function() {
    "use strict";

    angular
        .module("LambSample")
        .controller("userCtrl1",
        ["$window", "userService1",
        function($window, userService1) {
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
                userService1.createUser(newUser).then(function(user) {
                    vm.users.push(user);
                });
                cancelEdit();
            }

            function deleteOp(uuid) {
                userService1.deleteUser(uuid).then(function() {
                    var updatedUserList = [];
                    angular.forEach(vm.users, function(user) {
                        if (user.uuid !== uuid)
                            updatedUserList.push(user);
                    });
                    vm.users = updatedUserList;
                });
            }

            function edit(uuid) {
                angular.forEach(vm.users, function(user) {
                    if (user.uuid === uuid) {
                        angular.extend(vm.editUser, user);
                    }
                });
            }

            function init() {
                userService1.getAllUsers().then(function(data) {
                    vm.users = data.data;
                });
            }

            function update(updatedUser) {
                userService1.updateUser(updatedUser).then(function() {
                    angular.forEach(vm.users, function(user) {
                        if (user.uuid === updatedUser.uuid) {
                            angular.extend(user, updatedUser);
                        }
                    });
                    cancelEdit();
                });
            }
        }]);
})();