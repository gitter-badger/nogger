'use strict';
app.directive("login", function (socket) {
    return {
        restrict: 'E',
        templateUrl: "/views/login.html",
        link: function (scope) {
            scope.pw = '';
            scope.save = false;
            scope.working = false;
            scope.error = false;
            scope.$watch('pw', function(){
                scope.error = false;
            });
            scope.login = function () {
                if (scope.pw.trim().length > 0) {
                    scope.working = true;
                    socket.login(scope.pw, scope.save, function(){
                        scope.working = false;
                        scope.error = true;
                    });
                }
            }
        }
    }
});
