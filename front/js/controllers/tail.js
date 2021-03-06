'use strict';
app.controller("TailCtrl", function ($rootScope, $scope, socket, $location) {
    $scope.settings = {
        buffer: 50,
        grep: {
            input: '',
            regex: false,
            caseSensitive: false
        },
        highlight: {
            input: '',
            regex: false,
            caseSensitive: false
        },
        paused: false,
        follow: true
    };

    var pauseQueue = [];


    // update messages
    var debounceApply = _.debounce(function () {
        $scope.$apply();
        scrollBottom();
    }, 100);

    socket.on('line', addLine);

    // scroll to bottom
    $rootScope.$watch('logs.length', scrollBottom);
    $rootScope.$watch('settings.grep.input', scrollBottom);
    $rootScope.$watch('settings.grep.caseSensitive', scrollBottom);
    $rootScope.$watch('settings.buffer', scrollBottom);
    $rootScope.$watch('authenticated', getTail);
    window.scrollTo(0, document.body.scrollHeight);

    $scope.pause = function () {
        $scope.settings.paused = !$scope.settings.paused;
        if (!$scope.settings.paused && pauseQueue.length > 0) {
            $rootScope.logs = $rootScope.logs.concat(pauseQueue);
            if ($rootScope.logs.length > 500) {
                $rootScope.logs.splice(0, 100);
            }
        }
    };
    $scope.testHighlight = function (log) {
        if ($scope.settings.highlight.input.length === 0) {
            return false;
        }
        return test(log, 'highlight');
    };

    $scope.testGrep = function (log) {
        if ($scope.settings.grep.length === 0) {
            return true;
        }
        return test(log, 'grep');
    };

    $scope.clear = function () {
        $rootScope.logs = [];
    };

    function addLine(data) {
        if (!$scope.settings.paused) {
            $rootScope.logs.push(data);
            if ($rootScope.logs.length > 500) {
                console.log('exceeded 500 lines in cache - removing first 100');
                $rootScope.logs.splice(0, 100);
            }
            debounceApply();
        } else {
            pauseQueue.push(data);
            if (pauseQueue.length > 500) {
                pauseQueue.splice(0, 100);
            }
        }
    }

    function test(log, type) {
        if ($scope.settings[type].regex) {
            try {
                return log.match(new RegExp($scope.settings[type].input, $scope.settings[type].caseSensitive ? '' : 'i'));
            } catch (e) {
                return true;
            }
        } else {
            return log.toLowerCase().indexOf($scope.settings[type].input.toLowerCase()) != -1;
        }
    }

    function scrollBottom() {
        if ($scope.settings.follow && $location.path() === '/') {
            setTimeout(function () {
                window.scrollTo(0, document.body.scrollHeight)
            });
            window.scrollTo(0, document.body.scrollHeight)
        }
    }

    function getTail() {
        if (!$rootScope.authenticated) {
            return;
        }
        // get initial logs
        socket.emit('search', {
            limit: 20
        }, function (re) {
            console.log('search returned: ', re);
            if (re.err) {
                if (re.err && re.err.code === 'ENOENT') {
                    alert('search not supported on this system')
                } else {
                    alert(re.err);
                }
            } else {
                if (re.data && re.data.result) {
                    if (re.data.result[0] === '') {
                        re.data.result.splice(0, 1);
                    }
                    $rootScope.logs = re.data.result.reverse();
                } else {
                    $rootScope.logs = [];
                }
            }
            $scope.$apply();
        });
    }

    $scope.$on('$destroy', function () {
        socket.removeListener('line', addLine);
    })
});
