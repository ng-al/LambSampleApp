// Copyright (c) Alvin Pivowar 2015, 2016

(function(){
    "use strict";

    angular.module("LambSample", ["ngMessages", "ngRoute", "ngToast", "apLamb", "apLambSocks"]);

    angular
        .module("LambSample")
        .constant("lambConfig", {
            logLevel: "Normal"
        })
        .run(["toastDaemon", function(toastDaemon) {}]);
})();