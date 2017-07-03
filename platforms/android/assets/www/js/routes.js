angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('tabs-controller', {
    url: '/tabs',
    templateUrl: 'templates/tabs-controller.html',
    abstract:true
  })

  .state('tabs-controller.dashboard-report', {
    url: '/report-disorder',
    cache: false,
    views: {
      'tab2': {
        templateUrl: 'templates/dashboard-report.html',
        controller: 'dashboardReportCtrl'
      }
    }
  })

  .state('tabs-controller.dashboard-my-space', {
    url: '/my-space',
    cache: false,
    views: {
      'tab3': {
        templateUrl: 'templates/dashboard-my-space.html',
        controller: 'dashboardSpaceCtrl'
      }
    }
  })

  .state('login', {
    url: '/login',
    cache: false,
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('what-happened', {
    url: '/what',
    cache: false,
    templateUrl: 'templates/what-happened.html',
    controller: 'whatHappenedCtrl'
  })

  .state('who-did-it', {
    url: '/who',
    cache: false,
    templateUrl: 'templates/who-did-it.html',
    controller: 'whoDidItCtrl'
  })

  .state('to-whom', {
    url: '/whom',
    cache: false,
    templateUrl: 'templates/to-whom.html',
    controller: 'toWhomCtrl'
  })

  .state('who-saw-it', {
    url: '/saw',
    cache: false,
    templateUrl: 'templates/who-saw-it.html',
    controller: 'whoSawItCtrl'
  })

  .state('where-happened', {
    url: '/where',
    templateUrl: 'templates/where-happened.html',
    controller: 'whereHappenedCtrl'
  })

  .state('when-happened', {
    url: '/when',
    templateUrl: 'templates/when-happened.html',
    controller: 'whenHappenedCtrl'
  })

  .state('problems', {
    url: '/offender',
    cache: false,
    templateUrl: 'templates/problems.html',
    controller: 'offenderCtrl'
  })

  .state('witnessed', {
    url: '/witness',
    templateUrl: 'templates/witnessed.html',
    controller: 'witnessedCtrl'
  })

  .state('reported', {
    url: '/reporter',
    templateUrl: 'templates/reported.html',
    controller: 'reportedCtrl'
  })

  .state('problem-response', {
    url: '/response/:id/:name/:desc/:answers',
    templateUrl: 'templates/problem-response.html',
    controller: 'problemResponseCtrl'
  })

$urlRouterProvider.otherwise('/tabs/my-space')



});
