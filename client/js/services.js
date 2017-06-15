/* global io */

angular.module('starter.services', [])

        .factory('socket', function ($rootScope) {
            var socket = io.connect();
            return {
                on: function (eventName, callback) {
                    socket.on(eventName, function () {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            callback.apply(socket, args);
                        });
                    });
                },
                emit: function (eventName, data, callback) {
                    socket.emit(eventName, data, function () {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback.apply(socket, args);
                            }
                        });
                    });
                }
            };
        })

        .factory('User', function ($resource) {
            return $resource('/resource/users/:userName');
        })

        .factory('Question', function ($resource) {
            return $resource('/resource/questions/:questionId');
        })

        .factory('Answer', function ($resource) {
            return $resource('/resource/answers/:answerId', null, {
                'leaders': {
                    method: 'GET',
                    url: '/resource/leaders',
                    isArray: true
                }
            });
        })

        .factory('AuthenticationService', function () {
            var auth = {
                isAuthenticated: false,
                isAdmin: false
            };

            return auth;
        })

        .factory('TokenInterceptor', function ($q, $window, $location, AuthenticationService) {
            return {
                request: function (config) {
                    config.headers = config.headers || {};
                    if ($window.localStorage.token) {
                        config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
                    }
                    return config;
                },

                requestError: function (rejection) {
                    return $q.reject(rejection);
                },

                /* Set Authentication.isAuthenticated to true if 200 received */
                response: function (response) {
                    if (response !== null && response.status === 200 && $window.localStorage.token && !AuthenticationService.isAuthenticated) {
                        AuthenticationService.isAuthenticated = true;
                    }
                    return response || $q.when(response);
                },

                /* Revoke client authentication if 401 is received */
                responseError: function (rejection) {
                    if (rejection !== null && rejection.status === 401 && ($window.localStorage.token || AuthenticationService.isAuthenticated)) {
                        delete $window.localStorage.token;
                        AuthenticationService.isAuthenticated = false;
                        $location.path("/register");
                    }

                    return $q.reject(rejection);
                }
            };
        })

        .factory('RegistrationService', function ($window, $http, $ionicPopup, $rootScope, AuthenticationService) {
            return {
                login: function (email, password) {
                    return $http.post('/login', {
                        email: email,
                        password: password
                    }).then(function (result) {
                        $rootScope.user = result.data;
                        console.log(result.data);
                        AuthenticationService.isAuthenticated = true;
                        AuthenticationService.isAdmin = result.data.is_admin;

                        $window.sessionStorage.name = result.data.name;
                        $window.sessionStorage.email = result.data.email;
                        $window.sessionStorage.token = result.data.token;

                        $window.sessionStorage.is_admin = result.data.is_admin;
                        $window.localStorage.token = result.data.token;
                    }).catch(function (err) {
                        $ionicPopup.alert({
                            title: 'Failed',
                            content: err.data
                        });
                    });
                },

                changePassword: function (password, newPassword, confirmPassword, token) {
                    return $http.post('/change/password', {
                        password: password,
                        newPassword: newPassword,
                        confirmPassword: confirmPassword,
                        token: token
                    }).then(function (result) {
                        $rootScope.user = result.data;
                        console.log(result.data);
                        $window.sessionStorage.password = newPassword;
                        $ionicPopup.alert({
                            title: 'Success',
                            content: 'New Password: '.concat(newPassword)
                        });
                    }).catch(function (err) {
                        $ionicPopup.alert({
                            title: 'Failed',
                            content: err.data
                        });
                    });
                },

                editProfile: function (name, email, token, experience) {
                    return $http.post('/edit/profile', {
                        email: email,
                        name: name,
                        token: token,
                        experience: experience
                    }).then(function (result) {
                        $rootScope.user = result.data;
                        console.log(result.data);
                        $window.sessionStorage.name = name;
                        $window.sessionStorage.email = email;
                        $window.sessionStorage.experience = experience;
                        $ionicPopup.alert({
                            title: 'Success',
                            content: 'Name: '.concat(name) + ' <br> Email:'.concat(email)
                        });
                    }).catch(function (err) {
                        $ionicPopup.alert({
                            title: 'Failed',
                            content: err.data
                        });
                    });
                },

                logout: function () {
                    delete $window.localStorage.token;
                    for (var prop in $rootScope) {
                        if (prop.substring(0, 1) !== '$') {
                            delete $rootScope[prop];
                        }
                    }
                },

                register: function (user) {
                    return $http.post('/register', user).then(function (result) {
                        $rootScope.user = result.data;
                        AuthenticationService.isAuthenticated = true;
                        $window.sessionStorage.name = result.data.name;
                        $window.sessionStorage.is_admin = result.data.is_admin;
                        $window.localStorage.token = result.data.token;
                        console.log(result.data);
                    }).catch(function (err) {
                        $ionicPopup.alert({
                            title: 'Failed',
                            content: err.data
                        });
                    });
                }
            };
        })

        .factory('UserResponse', function () {
            var storageKey = 'userResponses';

            var localGet = function () {
                var ret = localStorage.getItem(storageKey);
                if (ret === null) {
                    ret = {};
                } else {
                    ret = JSON.parse(ret);
                }
                return ret;
            };

            var localSet = function (val) {
                localStorage.setItem(storageKey, JSON.stringify(val));
            };

            return {
                set: function (key, value) {
                    var answers = localGet();
                    answers[key] = value;
                    localSet(answers);
                },

                get: function (key) {
                    var answers = localGet();
                    return answers[key];
                },

                reset: function () {
                    localStorage.removeItem(storageKey);
                }
            };
        });