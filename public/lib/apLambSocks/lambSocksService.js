// Copyright (c) 2015, Alvin Pivowar
// All rights reserved.

(function () {
    "use strict";


    var DEFAULT_PRIORITY = 100;
    var LAMB_SOCKS_CHANNEL = "BLEAT";
    var SERVICE_NAME = "lambSocks";

    angular
        .module("apLambSocks")
        .factory(SERVICE_NAME,
        ["$log", "$q", "$rootScope", "Lamb", "lambConfigService", "sockService",
        function ($log, $q, $rootScope, Lamb, lambConfigService, sockService) {

            var _bus = new Lamb(SERVICE_NAME, $rootScope);
            var _registrations = null;
            var _transformId = 0;

            init();

            // Passing in a null index, returns the first sock.
            function getSock(index) {
                index = index || 0;

                var item;
                var sock;
                var socks;

                socks = lambConfigService.getSocks();
                if (angular.isArray(socks)) {
                    if (index >= socks.length) throw new Error("getSock: index out of range.");

                    item = socks[index];
                    sock = new Sock(item.protocol, item.host, item.port, item.channel);
                }

                sock = sock || new sockService.Sock();
                if (!sock.channel) sock.channel = LAMB_SOCKS_CHANNEL;
                return sock;
            }

            function getTransformById(id) {
                if (!id) throw new Error("getTransformById: id is required.");
                if (!angular.isNumber) throw new Error("getTransformById: id is not a number.");

                var transforms = getTransformsByCriteria({id: id});
                return (transforms.length === 1) ? transforms[0] : null;
            }

            // criteria: {host: string, port: string, channel: string, id: number, pattern: RegExp}
            function getTransformsByCriteria(criteria, methodName) {
                methodName = methodName || "getTransformsByCriteria";

                if (!criteria) throw new Error(methodName + ": criteria(object) is required.");
                if (!(criteria.host || criteria.port || criteria.channel || criteria.id || criteria.pattern))
                    throw new Error(methodName + ": criteria object malformed.");

                var i;
                var match;
                var result = [];
                var transform;

                if (!_registrations)
                    return result;

                for (i = 0; i < _registrations.length; ++i) {
                    transform = _registrations[i];

                    match = true;
                    //noinspection RedundantIfStatementJS
                    if (criteria.host && transform.identity.sock && criteria.host !== transform.identity.sock.host) match = false;
                    if (criteria.port && transform.identity.port && criteria.port !== transform.identity.sock.port) match = false;
                    if (criteria.channel && transform.identity.channel && criteria.channel !== transform.identity.sock.channel) match = false;
                    if (criteria.id && criteria.id !== transform.identity.id) match = false;
                    if (criteria.pattern && !regExpEquality(criteria.pattern, transform.identity.pattern)) match = false;

                    if (match)
                        result.push(transform);
                }

                return result;
            }

            function init() {
                var sock = getSock();
                sockService.initializeSocketIo(sock).then(function() {
                    startAllListeners();
                });
            }

            function messageHandler(sock, message) {
                var i;
                var lambMessage;
                var sockMessage;
                var transform;
                var transformDateTime;
                var transformFnResult;
                var transformsMatchingPattern = [];
                var transformsMatchingSock;
                var transformsOrderedByPriority;

                // Transformation results can be null (do not publish); otherwise must be a valid LambMessage.
                var isTransformFnResultValid = function(result) {
                    if (!result)
                        return true;

                    return (angular.isObject(result) && result.topic && result.data);
                };

                if (!(message.topic && message.data)) throw new Error("lambSocks: received malformed message from server");
                sockMessage = new SockMessage(sock, message.topic, message.data);

                if (lambConfigService.getLogLevel() !== lambConfigService.LogLevelEnum.NONE) {
                    $log.debug("lambSocks: " + "received " + sockMessage.receivedDateTime.toISOString() + JSON.stringify(message));
                }

                transformsMatchingSock = getTransformsByCriteria({host: sock.host, port: sock.port, channel: sock.channel});
                if (transformsMatchingSock.length === 0)
                    return;

                // Prune transforms based on matching pattern to server topic.
                for (i = 0; i < transformsMatchingSock.length; ++i) {
                    transform = transformsMatchingSock[i];
                    if (transform.identity.pattern.test(sockMessage.receivedTopic))
                        transformsMatchingPattern.push(transform);
                }

                // Order transforms based on priority.  (Highest first).
                transformsOrderedByPriority = transformsMatchingPattern.sort(function(a, b) {return b.priority - a.priority});

                // Apply the transformations.
                for (i = 0; i < transformsOrderedByPriority.length; ++i) {
                    transform = transformsOrderedByPriority[i];

                    try {
                        transformFnResult = transform.fn(angular.copy(sockMessage));
                    } catch(ex) {
                        $log("lambSocks: transformation threw exception " + transform.identity.toString());
                        break;
                    }

                    if (!(angular.isPromise(transformFnResult) || isTransformFnResultValid(transformFnResult))) {
                        $log("lambSocks: Transformation " + transform.identity.toString() +
                            " returned unrecognized result from transformation.");
                        break;
                    }

                    (function(iife) {
                        var deferredResult;

                        // Wrap the object result in a promise so that all results can be processed in the same manner.
                        //noinspection JSUnusedLocalSymbols
                        deferredResult =  angular.isPromise(iife.transformFnResult)
                            ? iife.transformFnResult
                            : $q(function(accept, reject) {return accept(iife.transformFnResult)});


                        deferredResult.then(function(result) {
                            transformDateTime = new Date();

                            if (!isTransformFnResultValid(result))
                                throw new Error("lambSocks: Transformation " + iife.transform.identity.toString() +
                                    " returned unrecognized result from transformation promise.");

                            lambMessage = result ? new LambMessage(result.topic, result.data) : null;
                            if (lambMessage) {
                                // The socket event is outside of the Angular $digest cycle.  Wrap it.
                                $rootScope.$applyAsync(function() {_bus.publish(lambMessage.topic, lambMessage.data);});
                                sockMessage.lambMessages.push(lambMessage);
                            }
                            sockMessage.history.push(new TransformHistoryItem(iife.transform.identity,
                                iife.transform.priority, transformDateTime, lambMessage));

                            if (lambConfigService.getLogLevel() === lambConfigService.LogLevelEnum.VERBOSE && !lambMessage) {
                                $log.info("lambSocks: transform " + iife.transform.identity.toString() + " returned null message.");
                            }

                            if (lambConfigService.getLogLevel() === lambConfigService.LogLevelEnum.NORMAL && lambMessage) {
                                $log.debug("lambSocks: published " + iife.transform.identity.toString() + " --> " +
                                    JSON.stringify(lambMessage));
                            }
                        });
                    })({transform: transform, transformFnResult: transformFnResult});
                }
            }

            function regExpEquality(x, y) {
                return (x instanceof RegExp) && (y instanceof RegExp) &&
                    (x.source === y.source) && (x.global === y.global) &&
                    (x.ignoreCase === y.ignoreCase) && (x.multiline === y.multiline);
            }

            // registerTransform(pattern, fn, [priority:number], [sock:object]
            function registerTransform(pattern, fn) {
                if (!pattern) throw new Error("registerTransform: pattern(RegExp) is required.");
                if (!(pattern instanceof RegExp)) throw new Error("registerTransform: pattern is not RegExp.");
                if (!fn) throw new Error("registerTransform: fn is required.");
                if (arguments.length > 4) throw new Error("usage: registerTransform(pattern:RegExp, fn, [priority:number], [sock:object])");

                var i;
                var id;
                var parameter;
                var priority = DEFAULT_PRIORITY;
                var sock = null;
                var transform;
                var transformIdentity;

                for (i = 2; i < arguments.length; ++i) {
                    parameter = arguments[i];
                    if (angular.isNumber(parameter)) priority = parameter;
                    if (angular.isObject(parameter)) sock = parameter;
                }

                id = ++_transformId;
                transformIdentity = new TransformIdentity(pattern, id, sock);
                transform = new Transform(transformIdentity, priority, fn);

                if (!_registrations)
                    _registrations = [];
                _registrations.push(transform);

                if (lambConfigService.getLogLevel() === lambConfigService.LogLevelEnum.VERBOSE) {
                    $log.info("lambSocks: " + "transform registered " + transformIdentity.toString());
                }

                return id;
            }

            function startAllListeners() {
                var i;
                var socks;

                socks = lambConfigService.getSocks();
                if (!socks || socks.length === 0) socks = [getSock()];

                for (i = 0; i < socks.length; ++i) {
                    sockService.registerListener(socks[i], messageHandler);
                }
            }

            // criteria: {host: string, port: string, channel: string, id: number, pattern: RegExp}
            function unregisterTransformsByCriteria(criteria) {
                var i;
                var j;
                var isIdInCollection;
                var result = [];
                var transforms;
                var unregistrations = [];

                transforms = getTransformsByCriteria(criteria, "unregisterTransformsByCriteria");
                if (transforms.length === 0)
                   return false;

                // Copy all transforms that were not matched.
                for (i = 0; i < _registrations.length; ++i) {
                    isIdInCollection = false;
                    for (j = 0; j < transforms.length; ++j) {
                        if (_registrations[i].identity.id === transforms.identity.id) {
                            isIdInCollection = true;
                            unregistrations.push(transforms[j]);
                            break;
                        }

                        if (!isIdInCollection)
                            result.push(_registrations[i]);
                    }
                }

                if (result.length === _registrations.length)
                    return false;

                _registrations = result;

                if (lambConfigService.getLogLevel() === lambConfigService.LogLevelEnum.VERBOSE) {
                    for (i = 0; i < unregistrations.length; ++i) {
                        $log.info("lambSocks: " + "transform unregistered " + unregistrations[i].identity.toString());
                    }
                }

                return true;
            }

            function unregisterTransformById(id) {
                if (!id) throw new Error("unregisterTransformById: id is required.");
                if (!angular.isNumber(id)) throw new Error("unregisterTransformById: id is not a number.");

                return unregisterTransformsByCriteria({id: id});
            }

            function unregisterTransformByPattern(pattern) {
                if (!pattern) throw new Error("unregisterTransformByPattern: pattern is required.");
                if (!(pattern instanceof RegExp)) throw new Error("unregisterTransformByPattern: pattern is not a RegExp.");

                return unregisterTransformsByCriteria({pattern: pattern});
            }

            return {
                getTransformsByCriteria: getTransformsByCriteria,
                getTransformById: getTransformById,
                registerTransform: registerTransform,
                unregisterTransformsByCriteria: unregisterTransformsByCriteria,
                unregisterTransformById: unregisterTransformById,
                unregisterTransformsByPattern: unregisterTransformByPattern
            }

        }]);


    function LambMessage(topic, data) {
        this.data = data;
        //noinspection JSUnusedGlobalSymbols
        this.publishDateTime = new Date();
        this.topic = topic;
    }

    function SockMessage(sock, topic, data) {
        this.history = [];
        this.lambMessages = [];
        this.receivedData = data;
        this.receivedDateTime = new Date();
        this.receivedTopic = topic;
        this.sock = sock;
    }


    function Transform(identity, priority, fn) {
        this.identity = identity;
        this.fn = fn;
        this.priority = priority;
    }

    function TransformHistoryItem(transformIdentity, transformPriority, transformDateTime, lambMessage) {
        //noinspection JSUnusedGlobalSymbols
        this.lambMessage = lambMessage;
        //noinspection JSUnusedGlobalSymbols
        this.transformDateTime = transformDateTime;
        //noinspection JSUnusedGlobalSymbols
        this.transformIdentity = transformIdentity;
        //noinspection JSUnusedGlobalSymbols
        this.transformPriority = transformPriority;
    }

    function TransformIdentity(pattern, id, sock) {
        this.id = id;
        this.pattern = pattern;
        this.sock = sock;

        this.toString = function() {
            return JSON.stringify(this, function(key, value) {
                return (key === "pattern") ? value.toString() : value;
            })
        }
    }
})();