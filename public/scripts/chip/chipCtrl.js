(function() {
    "use strict";

    var CONTROLLER_NAME = "chipCtrl";

    angular
        .module("LambSample")
        .controller(CONTROLLER_NAME,
        ["$scope", "$timeout", "chipService", "Lamb",
        function($scope, $timeout, chipService, Lamb) {
            var bus = new Lamb(CONTROLLER_NAME, $scope);

            var vm = this;
            vm.colorValues = [];

            vm.setLambRed = setLambRed;
            vm.setWatchRed = setWatchRed;

            init();

            function init() {
                var hexDigits = ['0', '3', '6', '9', 'C', 'F'];

                var i, j;

                for (i = 0; i < hexDigits.length; ++i) {
                    for (j = 0; j < hexDigits.length; ++j) {
                        vm.colorValues.push(hexDigits[i] + hexDigits[j]);
                    }
                }

                vm.red = "CC";
            }

            function setLambRed(r) {
                chipService.startDateTime = new Date();
                bus.publish("chip.red", r);

                $timeout(function() {
                    var milliseconds = chipService.updateDateTime - chipService.startDateTime;
                    alert("Milliseconds: " + milliseconds);
                }, 100);
            }

            function setWatchRed(r) {
                chipService.startDateTime = new Date();
                chipService.red = r;

                $timeout(function() {
                    var milliseconds = chipService.updateDateTime - chipService.startDateTime;
                    alert("Milliseconds: " + milliseconds);
                }, 100);
            }
        }]);
})();