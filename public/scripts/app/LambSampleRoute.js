/* Copyright (c) 2015 Alvin Pivowar */
(function(){
    "use strict";

    angular
        .module("LambSample")
        .config(
        ['$routeProvider',
        function($routeProvider) {
            $routeProvider
                .when("/ex1", {templateUrl: "templates/userCRUD1.html"})
                .when("/ex2", {templateUrl: "templates/userCRUD2.html"})
                .when("/ex3", {templateUrl: "templates/userCRUD3.html"})
                .when("/chip", {templateUrl: "templates/chip.html"})
                .when("/status", {templateUrl: "templates/status.html"})
                .otherwise({redirectTo: "/ex2"});
        }]);
})();