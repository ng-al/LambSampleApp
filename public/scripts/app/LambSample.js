/* Copyright (c) 2015 Alvin Pivowar */
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