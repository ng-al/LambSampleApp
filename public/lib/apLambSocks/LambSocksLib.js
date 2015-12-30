// Copyright (c) 2015, Alvin Pivowar
// All rights reserved.

(function() {
    "use strict";

    angular.module("apLambSocks", ["apLamb", "apSock"]);

    angular
        .module("apLambSocks")
        .run(["lambSocks", function(lambSocks) {}]);
})();