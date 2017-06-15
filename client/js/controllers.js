angular.module('starter.controllers', [])

        .controller('AppCtrl', function ($scope, $location, RegistrationService, $timeout, $rootScope, socket) {
            $scope.counter = 90;
            var mytimeout = null; // the current timeoutID
            // actual timer method, counts down every second, stops on zero
            $scope.onTimeout = function () {
                if ($scope.counter === 0) {
                    $scope.$broadcast('timer-stopped', 0);
                    $timeout.cancel(mytimeout);
                    return;
                }
                $scope.counter--;
                mytimeout = $timeout($scope.onTimeout, 1000);
            };
            $scope.startTimer = function () {
                mytimeout = $timeout($scope.onTimeout, 1000);
            };
            // stops and resets the current timer
            $scope.stopTimer = function () {
                $scope.$broadcast('timer-stopped', $scope.counter);
                $scope.counter = 90;
                $timeout.cancel(mytimeout);
            };

            $scope.logout = function () {
                if (typeof $rootScope.gameId !== "undefined") {
                    socket.emit('leave', {player: $rootScope.user.name, gameId: $rootScope.gameId});
                }
                RegistrationService.logout();
                $location.path("/register");
            };
            $scope.timeleft = '0 secs';
        })

        .controller('ModeCtrl', function ($scope, $location, $rootScope, socket) {
            $scope.selectMode = function (mode) {
                socket.emit('selectMode', mode);
                if (mode === 'chrono') {
                    $scope.stopTimer();
                }
                $rootScope.mode = mode;
                $location.path("/tab/quiz");
            };
        }
        )

        .controller('MenuCtrl', function ($scope, socket, $location, $rootScope) {
            // Create a unique Socket.IO Room
            $scope.createGame = function () {
                socket.emit('hostCreateNewGame', $rootScope.user);
                socket.on('newGameCreated', function (data) {
                    $rootScope.user.index = 1;
                    $rootScope.gameId = data.gameId;
                    $rootScope.selected_question = 1;
                    $scope.cpt = 0;
                    $location.path("/mode");
                });
            };
        }
        )

        .controller('JoinGameCtrl', function ($scope, socket, $location, $rootScope) {
            $scope.game = {
                id: ''
            };
            $scope.start = function () {
                socket.emit('join', {gameId: $scope.game.id, player: $rootScope.user});
                socket.on('success', function (data) {
                    $rootScope.mode = data.mode;
                    $rootScope.user.index = data.userIndex;
                    $rootScope.gameId = $scope.game.id;
                    socket.emit('newQuestion', $scope.game.id);
                    $location.path("/tab/quiz");
                });
            };
            socket.on('errorMsg', function (msg) {
                alert(msg);
            });
        }
        )

        .controller('QuizCtrl', function ($scope, $ionicLoading, socket, Question, Answer,
                AuthenticationService, UserResponse, $location, $rootScope
                ) {
            $scope.q = {};
            $scope.q.answers = ['one', 'two', 'three'];
            $scope.answer = null;
            $scope.q.hasAnswered = false;
            $scope.show_leaders = false;
            $scope.endOfParty = 0;
            $scope.is_admin = AuthenticationService.isAdmin;

            // triggered, when the timer stops, you can do something here, maybe show a visual indicator or vibrate the device
            $scope.$on('timer-stopped', function (event, remaining) {
                if (remaining === 0) {
                    socket.emit('newQuestion', $rootScope.gameId);
                    console.log('your time ran out!');
                }
            });

            $scope.leaveRoom = function () {
                socket.emit('leave', {player: $rootScope.user.name, gameId: $rootScope.gameId});
                delete $rootScope.gameId;
                if ($rootScope.mode === 'chrono') {
                    $scope.stopTimer();
                }
                $location.path("/");
            };

            $scope.hasAnswered = function () {
                return $scope.q.hasAnswered === true;
            };
            $scope.theEnd = function () {
                return $scope.endOfParty === true;
            };


            $scope.userAnswerCorrect = function (index) {
                // Is this the index of the user's response, and is it the right answer
                index = index + 1;
                return index === $scope.q.answer_index;
            };

            $scope.userAnswerWrong = function (index) {
                // Is this the index of the user's response, and is it the wrong answer
                index = index + 1;
                return index !== $scope.q.answer_index;
            };

            $scope.isCorrectAnswer = function (index) {
                // Is this the index of the correct answer
                index = index + 1;
                return index === $scope.q.answer_index;
            };

            $scope.saveChoice = function (index) {
                UserResponse.set($scope.q.id, index + 1);
                var a = new Answer({
                    gameId: $rootScope.gameId,
                    question_id: $scope.q.id,
                    answer_index: index + 1
                });
                a.$save(function () {
                    // Right answerindex + 1
                    $scope.q.answer_index = index + 1;
                    socket.emit('incrementPoints');
                    socket.emit('hasAnswered', $rootScope.gameId);
                    console.log('dans questionAnswered');
                    console.log('$rootScope.gameId=' + $rootScope.gameId);////////
                    socket.emit('incrCptQuestions', $rootScope.gameId);
                    console.log('dans questionAnswered');
                }, function (q) {
                    // Wrong answer
                    $scope.q.answer_index = q.data.answer_index;
                    socket.emit('hasAnswered', $rootScope.gameId);
                    console.log('dans questionAnswered');
                    console.log('$rootScope.gameId=' + $rootScope.gameId);////////
                    socket.emit('incrCptQuestions', $rootScope.gameId);
                    console.log('dans questionAnswered');
                });
                showLeaders();
                socket.emit('newQuestion', $rootScope.gameId);
            };

            Question.query({
                id: $rootScope.selected_question,
                select: ['question', 'answers', 'hints']
            }, function (rows) {
                $scope.q = rows[0];
            });

            socket.on('questions', function (msg) {
                $scope.q.hasAnswered = false;
                msg = JSON.parse(msg);
                console.log('dans socket on question');
                console.log('$scope.cpt=' + $scope.cpt);
                if (msg.question === 'start') {
                    UserResponse.reset();
                    return;
                } else if (msg.question === 'end') {
                    showLeaders();
                    $scope.timer = 1;
                    UserResponse.reset();
                    return;
                } else if ($scope.cpt === 4) {
                    showLeaders();
                    $scope.timer = 1;
                    $scope.endOfParty = true;
                    UserResponse.reset();
                    return;
                }
                $scope.timer = 3;
                $ionicLoading.show({
                    template: 'Next question in 3 seconds...'
                });

                var timer = setInterval(function () {
                    $scope.timer--;
                    $ionicLoading.show({
                        template: 'Next question in ' + $scope.timer + ' seconds...'
                    });
                    if ($rootScope.mode === 'chrono') {
                        $scope.stopTimer();
                    }
                    if ($scope.timer <= 0) {
                        $rootScope.selected_question = msg.id;
                        if ($rootScope.mode === "chrono") {
                            $scope.startTimer();
                        }
                        clearInterval(timer);
                        if (msg.question !== 'end') {
                            hideLeaders();
                        }
                        $ionicLoading.hide();
                        $scope.q = msg;
                        check_start();
                        $scope.$apply();
                    }
                }, 1000);

            });

            socket.on('questionAnswered', function (msg) {
                $scope.q.hasAnswered = msg;
            });

            socket.on('incrCpt', function (msg) {
                console.log('dans incrCpt');
                console.log('$scope.cpt=' + $scope.cpt);
                $scope.cpt = msg;
                console.log('$scope.cpt=' + $scope.cpt);
            });
            socket.on('roomMsg', function (msg) {
                $scope.roomMsg = msg;
            });

            socket.on('leave', function (playersInRoom) {
                var index = playersInRoom.indexOf($rootScope.user.name);
                $rootScope.user.index = index + 1;
            });

            function showLeaders() {
                $scope.show_leaders = true;
                $scope.leaders = Answer.leaders();
            }

            function hideLeaders() {
                $scope.show_leaders = false;
            }
        })

        .controller('RegisterCtrl', function ($scope, $location, RegistrationService) {
            $scope.user = {
                name: '',
                email: '',
                password: '',
                password2: ''
            };

            $scope.$parent.logout_text = 'Logout';

            $scope.register = function () {
                RegistrationService.register($scope.user).then(function () {
                    $location.path("/");
                });
            };
        })

        .controller('LoginCtrl', function ($scope, $location, RegistrationService) {
            $scope.user = {
                email: '',
                password: ''
            };

            $scope.$parent.logout_text = 'Register';

            $scope.login = function () {
                RegistrationService.login($scope.user.email, $scope.user.password).then(function () {
                    $location.path("/");
                });
            };

        })

        .controller('EditProfileCtrl', function ($scope, RegistrationService) {
            $scope.editProfile = function () {
                RegistrationService.editProfile($scope.user.name, $scope.user.email, $scope.user.token, $scope.user.experience).then(function () {
                });
            };
        })

        .controller('ChangePasswordCtrl', function ($scope, RegistrationService) {
            $scope.changePassword = function () {
                RegistrationService.changePassword($scope.user.password, $scope.user.newPassword, $scope.user.confirmPassword, $scope.user.token).then(function () {
                });
            };
        })

        .controller('CoachCtrl', function ($scope, User, $rootScope) {
            User.query({
                name: $rootScope.user.name,
                select: ['users']
            }, function (rows) {
                $scope.points = rows[0].points;
            });
        })

        .controller('LeadersCtrl', function ($scope, socket, Answer) {
            $scope.leaders = Answer.leaders();

            socket.on('answer', function (msg) {
                $scope.leaders = Answer.leaders();
            });

            $scope.$on('$destroy', function (event) {
                socket.removeAllListeners('answer');
            });

        })

        .controller('HomeCtrl', function ($scope, $location) {

        });