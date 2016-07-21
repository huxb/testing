'use strict';

var myApp = angular.module('PencilApp', ['ngSanitize', 'ui.router', 'ui.bootstrap']);

// configure routes
myApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('root', {
            url: '/',
            templateUrl: 'partials/root.html',
            controller: 'PencilCtrl'
        })
        .state('abstract', {
            templateUrl: 'partials/abstract.html',
            controller: 'OrderCtrl'
        })
        .state('orders', {
            parent: 'abstract',
            url: '/orders',
            templateUrl: 'partials/order.html'
        })
        .state('cart', {
            parent: 'abstract',
            url: '/orders/cart',
            templateUrl: 'partials/cart.html',
            controller: 'CartCtrl'
        })
        .state('pencil-id', {
            parent: 'abstract',
            url: '/orders/pencil-id/:pencil',
            templateUrl: 'partials/pencil-id.html',
            controller: 'DetailCtrl'
        })
    $urlRouterProvider.otherwise('/');
}]);

myApp.controller('PencilCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log('Hello World!');
}]);

myApp.controller('OrderCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log('Hello, Order Page.');

    $http.get('data/products.json').then(function (response) {
        $scope.products = response.data;
        console.log($scope.products);
    });

    $scope.quantities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    $scope.colors = ['black', 'red', 'green', 'blue', 'purple'];
}]);

myApp.controller('DetailCtrl', ['$scope', '$http', '$filter', '$stateParams', 'OrderService', function ($scope, $http, $filter, $stateParams, OrderService) {

    $http.get('data/products.json').then(function (response) {
        // selected pencil
        var products = response.data;
        var targetObj = $filter('filter')(products, {
            id: $stateParams.pencil
        }, true)[0];
        $scope.pencil = targetObj;
        console.log('selected pencil: ' + $scope.pencil.name);

        // add order
        $scope.saveOrder = function (pencil, quantity, color) {
            OrderService.addItem({ 'pencil': pencil, 'quantity': $scope.qty, 'colors': $scope.color });
            console.log(OrderService.orderlist);
        };
    });
}]);

myApp.controller('CartCtrl', ['$scope', '$http', '$uibModal', 'OrderService', function ($scope, $http, $uibModal, OrderService) {
    $scope.orderlist = OrderService.orderlist;

    $scope.showOrderlistToSubmit = function () {
        console.log($scope.orderlist);
        window.alert("Thank you for shopping with us!");
        OrderService.clearOrderlist();
        $scope.orderlist = OrderService.orderlist;
    };

    $scope.removeFromCart = function (id) {
        OrderService.removeItem(id);
        $scope.orderlist = OrderService.orderlist;
    };

    // calculate total price
    $scope.getTotal = function() {
        var total = 0;
        for (var i = 0; i < $scope.orderlist.length; i ++) {
            total += $scope.orderlist[i].quantity * $scope.orderlist[i].pencil.price;
        }
        return total;
    }

    // change color of an item
    $scope.changeColor = function(id, color) {
        OrderService.changeColor(id, color);
        console.log($scope.orderlist);
    }
    // change quantity of an item
    $scope.changeQty = function(id, qty) {
        console.log(qty);
        OrderService.changeQty(id, qty);
        console.log($scope.orderlist);
    }
}]);

myApp.factory('OrderService', function () {
    var service = {};  // object that is a service

    if(localStorage.orderlist !== undefined) {
        service.orderlist = JSON.parse(localStorage.orderlist);
    } else {
        service.orderlist = [];
    }

    service.message = "Hello, I am a servcie.";
    service.addItem = function (item) {
        var id = 0;
        for (var i = 0; i < service.orderlist.length; i++) {
            if (service.orderlist[i].id > id) { id = service.orderlist[i].id };
        }
        item.id = id + 1;
        service.orderlist.push(item);
        window.localStorage.orderlist = JSON.stringify(service.orderlist);
    };
    service.removeItem = function (id) {
        for (var i = 0; i < service.orderlist.length; i++) {
            console.log(service.orderlist[i]);
            if (service.orderlist[i].id == id) {
                service.orderlist.splice(i, 1);
            }
        }
        window.localStorage.orderlist = JSON.stringify(service.orderlist);
    };

    service.clearOrderlist = function() {
        service.orderlist = [];
        window.localStorage.orderlist = JSON.stringify(service.orderlist);
    }

    service.changeColor = function(id, color) {
        for (var i = 0; i < service.orderlist.length; i ++) {
            if (service.orderlist[i].id == id) {
                service.orderlist[i].colors = color;
            }
        }
        window.localStorage.orderlist = JSON.stringify(service.orderlist);
    }

    service.changeQty = function(id, qty) {
        for (var i = 0; i < service.orderlist.length; i ++) {
            if (service.orderlist[i].id == id) {
                service.orderlist[i].quantity = qty;
            }
        }
        window.localStorage.orderlist = JSON.stringify(service.orderlist);
        console.log(service.orderlist);
    }

    return service;
});