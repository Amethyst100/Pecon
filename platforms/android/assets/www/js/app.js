// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives', 'app.services', "ion-datetime-picker", 'angular-jwt', 'ionMDRipple'])

  .config(function ($ionicConfigProvider, $sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['self', '*://pecon.herokuapp.com/**', '*://api.pecon.localhost/**', '*://player.vimeo.com/video/**']);
  })

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })

  .run(function ($rootScope, $state, AuthService, AUTH_EVENTS, OffenderService, AuthService, $ionicPopup) {
    $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
      if (fromState.url == '/login') {
        OffenderService.setCasesAsync().then(
          function(cases) {
            // var response_required = false;
            // for (var i = 0; i < cases.length; i++) {
            //   if (cases[i].offenders[i].answers.length == 0) {
            //     response_required = true;
            //   }
            // }
            var userProfile = AuthService.userProfile();

            var response_required = false;
            for (var i = 0; i < cases.length; i++) {
              for (var j = 0; j < cases[i].offenders.length; j++) {
                if (cases[i].offenders[j].student._id === userProfile._id) {
                  if (cases[i].offenders[j].answers.length == 0) {
                    response_required = true;
                  }
                }
              }
            }
            if (response_required) {
              var alertPopup = $ionicPopup.alert({
                title: 'Notificación del ofensor',
                template: 'Usted ha sido hecho como un ofensor. ¡Proporcione respuesta!'
              });
            }
          }, function(error) {
            console.log(error);
          }
        );
      }
      if (!AuthService.isAuthenticated()) {
        if (next.name !== 'login') {
          event.preventDefault();
          $state.go('login');
        }
      }
    });
  })
  .run(function($ionicPickerI18n) {
    $ionicPickerI18n.weekdays = ["D", "L", "M", "X", "J", "V", "S"];
    $ionicPickerI18n.months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    $ionicPickerI18n.ok = "Confirmar";
    $ionicPickerI18n.cancel = "Cancelar";
    $ionicPickerI18n.okClass = "button-positive";
    $ionicPickerI18n.cancelClass = "button-stable";
  })

  /*
   This directive is used to disable the "drag to open" functionality of the Side-Menu
   when you are dragging a Slider component.
   */
  .directive('disableSideMenuDrag', ['$ionicSideMenuDelegate', '$rootScope', function ($ionicSideMenuDelegate, $rootScope) {
    return {
      restrict: "A",
      controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

        function stopDrag() {
          $ionicSideMenuDelegate.canDragContent(false);
        }

        function allowDrag() {
          $ionicSideMenuDelegate.canDragContent(true);
        }

        $rootScope.$on('$ionicSlides.slideChangeEnd', allowDrag);
        $element.on('touchstart', stopDrag);
        $element.on('touchend', allowDrag);
        $element.on('mousedown', stopDrag);
        $element.on('mouseup', allowDrag);

      }]
    };
  }])

  /*
   This directive is used to open regular and dynamic href links inside of inappbrowser.
   */
  .directive('hrefInappbrowser', function () {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      link: function (scope, element, attrs) {
        var place = attrs['hrefInappbrowser'] || '_system';
        element.bind('click', function (event) {

          var href = event.currentTarget.href;

          window.open(href, place, 'location=yes');

          event.preventDefault();
          event.stopPropagation();

        });
      }
    };
  });
