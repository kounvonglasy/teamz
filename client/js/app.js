// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngResource', 'ngIdle'])

        .run(function ($window, $location, $ionicPlatform, $rootScope, AuthenticationService, RegistrationService, Idle) {
            // start watching when the app runs. also starts the Keepalive service by default.
            Idle.watch();
            $rootScope.$on('IdleTimeout', function () {
                // end their session and redirect to login
                RegistrationService.logout();
                $location.path("/home");
                Idle.watch();
            });

            $rootScope.user = {
                name: $window.sessionStorage.name,
                email: $window.sessionStorage.email,
                token: $window.sessionStorage.token,
                experience: $window.sessionStorage.experience,
                is_admin: $window.sessionStorage.is_admin
            };

            if ($rootScope.user.is_admin) {
                AuthenticationService.isAdmin = true;
            }

            $rootScope.$on("$stateChangeStart", function (event, toState) {
                //redirect only if both isAuthenticated is false and no token is set
                if (['home', 'login', 'logout', 'register'].indexOf(toState.name) === -1) {
                    if (!AuthenticationService.isAuthenticated && !$window.localStorage.token) {
                        event.preventDefault();
                        $location.path("/home");
                    }
                }
            });

            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }
            });
        })

        .config(function ($stateProvider, $urlRouterProvider, $httpProvider, IdleProvider) {

            // Ionic uses AngularUI Router which uses the concept of states
            // Learn more here: https://github.com/angular-ui/ui-router
            // Set up the various states which the app can be in.
            // Each state's controller can be found in controllers.js
            IdleProvider.idle(599); // 9:59 minutes idle
            IdleProvider.timeout(1); // after 9:59 idle, time the user out
            $stateProvider.state('home', {
                url: "/home",
                templateUrl: "templates/home.html",
                controller: 'HomeCtrl'
            })

                    .state('register', {
                        url: "/register",
                        templateUrl: "templates/register.html",
                        controller: 'RegisterCtrl'
                    })

                    .state('login', {
                        url: "/login",
                        templateUrl: "templates/login.html",
                        controller: 'LoginCtrl'
                    })
                    
                    .state('mode', {
                        url: "/mode",
                        templateUrl: "templates/select_mode.html",
                        controller: 'ModeCtrl'
                    })
                    
                    .state('menu', {
                        url: "/menu",
                        templateUrl: "templates/menu.html",
                        controller: 'MenuCtrl'
                    })

                    .state('join', {
                        url: "/join",
                        templateUrl: "templates/join_game.html",
                        controller: 'JoinGameCtrl'
                    })

                    .state('changePassword', {
                        url: "/change/password",
                        templateUrl: "templates/change_password.html",
                        controller: 'ChangePasswordCtrl'
                    })

                    // setup an abstract state for the tabs directive
                    .state('tab', {
                        url: "/tab",
                        abstract: true,
                        templateUrl: "templates/tabs-container.html"
                    })

                    // Each tab has its own nav history stack:

                    .state('tab.quiz', {
                        url: '/quiz',
                        views: {
                            'tab-quiz': {
                                templateUrl: 'templates/tab-quiz.html',
                                controller: 'QuizCtrl'
                            }
                        }
                    })

                    .state('tab.profile', {
                        url: "/profile",
                        views: {
                            'tab-profile': {
                                templateUrl: "templates/edit_profile.html",
                                controller: 'EditProfileCtrl'
                            }
                        }
                    })

                    .state('tab.coach', {
                        url: "/coach",
                        views: {
                            'tab-coach': {
                                templateUrl: "templates/coach.html",
                                controller: 'CoachCtrl'
                            }
                        }
                    })

                    .state('tab.leaders', {
                        url: '/leaders',
                        views: {
                            'tab-leaders': {
                                templateUrl: 'templates/tab-leaders.html',
                                controller: 'LeadersCtrl'
                            }
                        }
                    });


            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/menu');

            // Register middleware to ensure our auth token is passed to the server
            $httpProvider.interceptors.push('TokenInterceptor');

        });