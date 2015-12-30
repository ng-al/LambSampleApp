(function() {
    "use strict";

    angular.module("apSock", []);

    var SOCKET_IO_PATH = "/socket.io/socket.io.js";

    angular
        .module("apSock")
        .factory("sockService",
        ["$http", "$location","$q", "$window",
        function($http, $location, $q, $window) {

            // buildSockPath([sock(Sock)], [path(string)])
            function buildSockPath() {
                if (arguments.length > 2) throw new Error("usage: buildSockPath([Sock], [path])");

                var i;
                var path;
                var sock;

                for (i = 0; i < arguments.length; ++i) {
                    if (arguments[i] instanceof Sock) sock = arguments[i];
                    if (angular.isString(arguments[i])) path = arguments[i];
                }

                sock = sock || new Sock();
                return sock.protocol + "://" + sock.host + ":" + sock.port + (path ? path : "");
            }

            function globalEval(src) {
                // IE
                if ($window.execScript) {
                    $window.execScript(src);
                    return;
                }

                (function () {
                    $window.eval.call($window, src);
                })();
            }

            function initializeSocketIo(sock) {
                sock = sock || new Sock();

                return $q(function(accept, reject) {
                    var path;

                    if ($window.io) {
                        accept();
                        return;
                    }

                    path = buildSockPath(sock, SOCKET_IO_PATH);

                    $http.get(path).then(function (data) {
                        var script = data.data;
                        globalEval(script);
                        if ($window.io) {
                            accept();
                            return;
                        }

                        throw new Error("Internal error during processing socket.io.js");

                    }, function () {
                        throw new Error("Unable to fetch socket.io library from " + path + ".");
                    });
                });
            }

            function registerListener(sock, fn) {
                if (!sock) throw new Error("registerListener: sock is required.");
                if (!(sock instanceof Sock)) throw new Error("registerListener: sock not recognized as a valid sock");
                if (!sock.channel) throw new Error("registerListener: Channel not specified.");

                if (!fn) throw new Error("registerListener: Callback fn is required.");
                if (!angular.isFunction(fn)) throw new Error("registerListener: fn not recogized as a valid callback fn.");

                if (!$window.io) throw new Error("socket.io client library missing.");

                var path = buildSockPath(sock);
                var socket = $window.io.connect(path);
                socket.on(sock.channel, function(message) {
                    fn(sock, message);
                });

                return socket;
            }

            return {
                Sock: Sock,
                buildSockPath: buildSockPath,
                initializeSocketIo: initializeSocketIo,
                registerListener: registerListener
            };


            function Sock(protocol, host, port, channel) {
                var that = (this instanceof Sock) ? this : Object.create(Sock.prototype);

                if (host) {
                    that.protocol = protocol || "http";
                    that.host = host;
                    that.port = port || 80;
                    that.channel = channel;

                } else {
                    that.protocol = protocol || $location.$$protocol;
                    that.host = host || $location.$$host;
                    that.port = port || $location.$$port;
                    that.channel = channel;
                }
            }
        }]);
})();