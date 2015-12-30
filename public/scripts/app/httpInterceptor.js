(function() {
    "use strict";

    angular
        .module("LambSample")
        .config(
        ["$httpProvider",
        function ($httpProvider ) {
            $httpProvider.interceptors.push(
                ["Lamb",
                function (Lamb) {
                    var bus = new Lamb("HTTP");

                    function response(response) {
                        var message = response.headers("x-Message");
                        if (message)
                            bus.publish((response.status !== 204) ? "http.success" : "http.noContent", message);
                        return response;
                    }

                    function responseError(response) {
                        var message = response.headers("x-Message");
                        if (message)
                            bus.publish("http.failure", message);
                        return response;
                    }

                    return({
                        response: response,
                        responseError: responseError
                    })
                }]);
        }]);
})();