/* Copyright (c) 2015 Alvin Pivowar */
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
