'use strict';
var app = angular.module('app', [
        'ngSanitize',
        'ngRoute',
        'ui.bootstrap',
        'pasvaz.bindonce'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/logs', {
                templateUrl: 'views/logs.html',
                controller: 'LogsCtrl'
            })
            .when('/', {
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
