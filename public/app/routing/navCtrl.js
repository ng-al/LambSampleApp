// Copyright (c) Alvin Pivowar 2015, 2016

(function(){
    "use strict";

    angular
        .module("LambSample")
        .controller("navCtrl",
        ["$location",
        function($location) {
            var vm = this;
            vm.isActive = isActive;
            vm.$location = $location;   // Used to document $location on /route page.

            function isActive(path) {
                return ($location.path() === path);
            }
        }]);
})();
