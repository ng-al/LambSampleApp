// Copyright (c) Alvin Pivowar 2015, 2016

(function(){
    "use strict";

    angular
        .module("LambSample")
        .config(
        ['$routeProvider',
        function($routeProvider) {
            $routeProvider
                .when("/ex1", {templateUrl: "examples/ex1/userCRUD1.html"})
                .when("/ex2", {templateUrl: "examples/ex2/userCRUD2.html"})
                .when("/ex3", {templateUrl: "examples/ex3/userCRUD3.html"})
                .when("/chip", {templateUrl: "examples/chip/chip.html"})
                .when("/status", {templateUrl: "examples/status/status.html"})
                .otherwise({redirectTo: "/ex2"});
        }]);
})();