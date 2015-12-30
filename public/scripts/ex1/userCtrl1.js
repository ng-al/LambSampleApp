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
                vm.editUser = { id: "new"};
            }

            function cancelEdit() {
                vm.editUser = {};
            }

            function create(newUser) {
                delete newUser.id;
                userService1.createUser(newUser).then(function(data) {
                    newUser.id = data.data.id;
                    vm.users.push(newUser);
                });
                cancelEdit();
            }

            function deleteOp(id) {
                userService1.deleteUser(id).then(function() {
                    var updatedUserList = [];
                    angular.forEach(vm.users, function(user) {
                        if (user.id !== id)
                            updatedUserList.push(user);
                    })
                    vm.users = updatedUserList;
                });
            }

            function edit(id) {
                angular.forEach(vm.users, function(user) {
                    if (user.id === id) {
                        angular.extend(vm.editUser, user);
                    }
                });
            }

            function init() {
                userService1.getAllUsers().then(function(data) {
                    vm.users = data.data;
                });

                //var socket = $window.io();
                //socket.on('LambSocks', function (data) {
                //    alert(JSON.stringify(message));
                //});
            }

            function update(updatedUser) {
                userService1.updateUser(updatedUser).then(function() {
                    angular.forEach(vm.users, function(user) {
                        if (user.id === updatedUser.id) {
                            angular.extend(user, updatedUser);
                        }
                    });
                    cancelEdit();
                });
            }
        }]);
})();