(function() {
    "use strict";

    var SERVICE_NAME = "toastDaemon";

    angular
        .module("LambSample")
        .factory(SERVICE_NAME,
        ["Lamb", "ngToast", "statusSettings",
        function(Lamb, ngToast, statusSettings) {
            init();

            function init() {
                var bus = new Lamb(SERVICE_NAME);

                bus.subscribe("http.*", function(message, info) {
                    var severity;

                    if (statusSettings.useToast) {
                        severity = info.getSubtopic(1, "info");
                        if (severity === "success")
                            ngToast.success(message);

                        if (severity === "failure")
                            ngToast.danger(message);

                        if (severity === "noContent")
                            ngToast.warning(message);

                        if (severity === "info")
                            ngToast.info(message);
                    }
                });
            }

            return {};
        }]);
})();