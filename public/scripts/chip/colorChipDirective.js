(function() {
    "use strict";

    var DIRECTIVE_NAME = "colorChip";

    angular
        .module("LambSample")
        .directive(DIRECTIVE_NAME,
        ["chipService", "Lamb",
        function(chipService, Lamb) {
            return {
                restrict: 'E',
                scope: {
                    r: '@',
                    g: '@',
                    b: '@',
                    method: '@'
                },
                link: function(scope, elem, attrs) {
                    var bus;
                    var callBackDateTime;
                    var i;

                    if (scope.r)
                        elem.css("background-color", "#" + scope.r + scope.g + scope.b);

                    if (attrs.hasOwnProperty("useWatch")) {
                        scope.$watch(function() { return chipService.red; }, function(newValue) {
                            elem.css("background-color", "#" + newValue + scope.g + scope.b);
                            chipService.updateDateTime = new Date();
                        });

                        for (i = 0; i < 9; ++i) {
                            scope.$watch(function() { return chipService.red; }, function() {
                                callBackDateTime = new Date();
                            });
                        }
                    }

                    if (attrs.hasOwnProperty("useLamb")) {
                        bus = new Lamb(DIRECTIVE_NAME, scope);

                        bus.subscribe("chip.red", function(data) {
                            elem.css("background-color", "#" + data + scope.g + scope.b);
                            chipService.updateDateTime = new Date();
                        });

                        for (i = 0; i < 9; ++i) {
                            bus.subscribe("chip.red", function() {
                                callBackDateTime = new Date();
                            });
                        }
                    }
                },
                template: '<div class="color-chip"></div>',
                replace: true
            }
        }]);
})();