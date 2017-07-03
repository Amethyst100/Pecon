angular.module('app.controllers', [])

.controller('appCtrl', ['$scope', '$state', '$ionicPopup', 'AuthService', 'AUTH_EVENTS',
  function ($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
    $scope.userId = AuthService.userId();
    $scope.userProfile = AuthService.userProfile();

    $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
      AuthService.logout();
      $state.go('login', {}, {reload: true});
    });

    $scope.setCurrentUserId = function(id) {
      $scope.userId = id;
    };
  }])

.controller('menuCtrl', ['$scope', '$state', '$stateParams', '$ionicSideMenuDelegate', '$ionicHistory', 'PeconService', 'AuthService', 'OffenderService',
function ($scope, $state, $stateParams, $ionicSideMenuDelegate, $ionicHistory, PeconService, AuthService, OffenderService) {
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);

  $scope.logout = function () {
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    PeconService.resetReport();
    OffenderService.unsetCases();
    AuthService.logout();
    $state.go('login');
  }
}])

.controller('dashboardReportCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate','$ionicHistory', '$ionicPopup', 'StatusFactory', 'PeconService', 'OffenderService', 'QuestionService', 'AuthService', '$state',
function ($scope, $stateParams, $ionicSideMenuDelegate, $ionicHistory, $ionicPopup, StatusFactory, PeconService, OffenderService, QuestionService, AuthService, $state) {
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);

  $scope.disorderStatus = JSON.parse(StatusFactory.get('incident_type'));
  $scope.victimStatus = StatusFactory.get('victims');
  if ($scope.victimStatus) {
    if (JSON.parse($scope.victimStatus).length == 0) {
      $scope.victimStatus = undefined;
    }
  }
  $scope.offenderStatus = StatusFactory.get('offender');
  if ($scope.offenderStatus) {
    if (JSON.parse($scope.offenderStatus).length == 0) {
      $scope.offenderStatus = undefined;
    }
  }
  $scope.witnessStatus = StatusFactory.get('witness');
  if ($scope.witnessStatus) {
    if (JSON.parse($scope.witnessStatus)) {
      if (JSON.parse($scope.witnessStatus).length == 0) {
          $scope.witnessStatus = undefined;
      }
    }
  }
  $scope.placeStatus = JSON.parse(StatusFactory.get('place_type'));
  $scope.dateStatus = JSON.parse(StatusFactory.get('date'));

  if (StatusFactory.get('victim_not_required')) {
    if (JSON.parse(StatusFactory.get('victim_not_required')) === 'true') {
      $scope.victimNotRequired = true;
    } else {
      $scope.victimNotRequired = false;
    }
  }

  if ($scope.dateStatus) {
    $scope.timeStatus = JSON.parse(StatusFactory.get('time'));
  } else {
    $scope.timeStatus = undefined;
  }
  if ($scope.offenderStatus) {
    var offenders = JSON.parse($scope.offenderStatus);
    $scope.userProfile = AuthService.userProfile();
    if (offenders.indexOf($scope.userProfile._id) != -1) {
      $scope.offenderInvalid = true;
    } else {
      $scope.offenderInvalid = false;
    }
  } else {
    $scope.offenderInvalid = false;
  }

  if ($scope.victimStatus) {
    $scope.userProfile = AuthService.userProfile();
    if ($scope.witnessStatus)
      var witnesses = JSON.parse($scope.witnessStatus);
    else {
      witnesses = [];
    }
    var victims = JSON.parse($scope.victimStatus);
    if (witnesses.indexOf($scope.userProfile._id) != -1 || victims.indexOf($scope.userProfile._id) != -1) {
      $scope.reporterInvalid = false;
    } else {
      $scope.reporterInvalid = true;
    }
  }

  if($scope.disorderStatus && ($scope.victimNotRequired || $scope.victimStatus) && $scope.offenderStatus && $scope.placeStatus && $scope.timeStatus && $scope.dateStatus && !$scope.offenderInvalid && !$scope.reporterInvalid){
    $scope.submitResponseButtonStatus = true;
  } else {
    $scope.submitResponseButtonStatus = false;
  }
  $scope.userProfile = AuthService.userProfile();

  QuestionService.setReporterQuestions().then(
    function(success) {
      $scope.questions = success;
    }, function(error) {
    }
  );

  $scope.save = function(){
    PeconService.submitCase().then(
      function(sent) {
        OffenderService.setResponse(sent._id, sent.answers).then(function(success) {
        }, function(error) {

        });
        var alertPopup = $ionicPopup.alert({
          title: 'Caso enviado',
          template: 'Gracias por tu tiempo!'
        });
        $state.go('tabs-controller.dashboard-my-space', {}, {reload: true});
      }, function(error) {
        $scope.isProcessing = false;
        $scope.err = "Invalid credentials, please try again!";
      });
  }

}])

.controller ('dashboardSpaceCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate','$ionicHistory', 'StatusFactory', 'AuthService', 'OffenderService',
function ($scope, $stateParams, $ionicSideMenuDelegate, $ionicHistory, StatusFactory, AuthService, OffenderService) {
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);
  $scope.num_response = 0;
  $scope.res_notification = true;

  $scope.userProfile = AuthService.userProfile();

  OffenderService.setCases().then(
    function(cases) {
      $scope.num_response = 0;

      var response_required = false;
      for (var i = 0; i < cases.length; i++) {
        for (var j = 0; j < cases[i].offenders.length; j++) {
          if (cases[i].offenders[j].student._id === $scope.userProfile._id) {
            if (cases[i].offenders[j].answers.length == 0) {
              response_required = true;
              $scope.num_response++;
            }
          }
        }
      }

      $scope.res_notification = !response_required;
    }, function(error) {
    }
  );

  OffenderService.setCasesAsync().then(
    function(cases) {
      // console.log(cases);
      $scope.num_response = 0;

      var response_required = false;
      for (var i = 0; i < cases.length; i++) {
        for (var j = 0; j < cases[i].offenders.length; j++) {
          if (cases[i].offenders[j].student._id === $scope.userProfile._id) {
            if (cases[i].offenders[j].answers.length == 0) {
              response_required = true;
              $scope.num_response++;
            }
          }
        }
      }

      $scope.res_notification = !response_required;
    }, function(error) {
    }
  );

  var cases = JSON.parse(StatusFactory.get('reportercases'));
  $scope.case_reported = cases != null ? cases.length : " ";
}])

.controller('loginCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate', 'AuthService', 'OffenderService', '$state', '$ionicPopup',
function ($scope, $stateParams, $ionicSideMenuDelegate, AuthService, OffenderService, $state, $firebaseArray, $ionicPopup) {
  $ionicSideMenuDelegate.canDragContent(false);
  $scope.data = {};
  $scope.isProcessing = false;

  $scope.login = function(data) {
    // if(window.Connection) {
    //   if(navigator.connection.type == Connection.NONE) {
        if (data.username == undefined ||data.username == '' || data.password == '' || data.password == undefined) {
          $scope.err = "Por favor, introduce tu usuario y contraseña.";//Please enter your credentials!
        } else {
          $scope.isProcessing = true;
          AuthService.login(data.username, data.password).then(function(authenticated) {
            $state.go('tabs-controller.dashboard-my-space', {}, {reload: true});
          }, function(error) {
            $scope.isProcessing = false;
            $scope.err = "Datos incorrectos. Por favor, prueba de nuevo.";//Invalid credentials, please try again!
          });
        }
      // } else {
      //   $ionicPopup.confirm({
      //     title: 'No Internet Connection',
      //     content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
      //   });
      // }
    // }
  };
}])

.controller('whatHappenedCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate', 'IncidentService', 'SaveFactory', 'StatusFactory', '$state',
function ($scope, $stateParams, $ionicSideMenuDelegate, IncidentService, SaveFactory, StatusFactory, $state) {
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);
  $scope.incidents=[];

  var selectedType = JSON.parse(StatusFactory.get('incident_type'));

  IncidentService.setIncidents().then(
    function(success) {
      for (var i = 0; i < success.length; i++) {
        if (success[i]._id === selectedType) {
          success[i].selected = undefined;
        } else {
          success[i].selected = false;
        }
      }
      $scope.incidents = success;
    }, function(error) {
    }
  );

  IncidentService.setIncidentsAsync().then(
    function(success) {
      for (var i = 0; i < success.length; i++) {
        if (success[i]._id === selectedType) {
          success[i].selected = undefined;
        } else {
          success[i].selected = false;
        }
      }
      $scope.incidents = success;
    }, function(error) {
    }
  );
  $scope.save = function(item) {
    if (item._id === '587f6af431e428110045299e' || item.title === 'Estropear el ambiente' || item.title === 'Spoil the atmosphere') {
      SaveFactory.save('victim_not_required', 'true');
      var victims = []
      SaveFactory.save('victims', victims);
    } else {
      SaveFactory.save('victim_not_required', 'false');
    }
    SaveFactory.save('incident_type',item._id);
    $state.go('tabs-controller.dashboard-report', {}, {reload: true});
  };
}])

.controller('whoDidItCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate', 'StudentService', 'StatusFactory', 'SaveFactory', '$state',
function ($scope, $stateParams, $ionicSideMenuDelegate, StudentService, StatusFactory, SaveFactory, $state) {
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);

  $scope.students=[];

  StudentService.setStudents().then(
    function(success) {
      $scope.students = success;
      $scope.victims = JSON.parse(StatusFactory.get('victims'));
      for (var i=0; i<$scope.students.length; i++) {
        if ($scope.victims != null) {
          $scope.students[i].victim = $scope.victims.indexOf($scope.students[i]._id) != -1;
        } else {
          $scope.students[i].victim = false;
        }
      }
      $scope.witness = JSON.parse(StatusFactory.get('witness'));
      for (var i=0; i<$scope.students.length; i++) {
        if ($scope.witness != null) {
          $scope.students[i].witness = $scope.witness.indexOf($scope.students[i]._id) != -1;
        } else {
          $scope.students[i].witness = false;
        }
      }
      $scope.offenders = JSON.parse(StatusFactory.get('offender'));
      for (var i=0; i<$scope.students.length; i++) {
        if ($scope.offenders != null) {
          $scope.students[i].offender = $scope.offenders.indexOf($scope.students[i]._id) != -1;
        } else {
          $scope.students[i].offender = false;
        }
      }
    }, function(error) {
    }
  );
  $scope.offenders=[];
  $scope.add = function(item, value, witness, victim){
    if (!witness && !victim) {
      if (value) {
        if ($scope.offenders == null) {
          $scope.offenders=[];
        }
        if($scope.offenders.indexOf(item._id) == -1){
          $scope.offenders.push(item._id);
        }
      } else {
        $scope.offenders.splice($scope.offenders.indexOf(item._id), 1);
      }
      // console.log("offenders : "+$scope.offenders);
    }
  };
  $scope.save = function(){
    SaveFactory.save('offender',$scope.offenders);
    $state.go('tabs-controller.dashboard-report', {}, {reload: true});
  }

}])

.controller('toWhomCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate', '$ionicPopup', 'StudentService', 'StatusFactory', 'AuthService', 'SaveFactory', '$state',
function ($scope, $stateParams, $ionicSideMenuDelegate, $ionicPopup, StudentService, StatusFactory, AuthService, SaveFactory, $state) {
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);

  $scope.students = [];

  $scope.userProfile = AuthService.userProfile();

  $scope.isSelf = false;
  $scope.flags = { student_intervene: false, official_intervene: false };

  StudentService.setStudents().then(
    function(success) {
      $scope.students = success;
      $scope.offenders = JSON.parse(StatusFactory.get('offender'));
      for (var i=0; i<$scope.students.length; i++) {
        if ($scope.offenders != null) {
          $scope.students[i].offender = $scope.offenders.indexOf($scope.students[i]._id) != -1;
        } else {
          $scope.students[i].offender = false;
        }
      }
      $scope.witness = JSON.parse(StatusFactory.get('witness'));
      for (var i=0; i<$scope.students.length; i++) {
        if ($scope.witness != null) {
          $scope.students[i].witness = $scope.witness.indexOf($scope.students[i]._id) != -1;
        } else {
          $scope.students[i].witness = false;
        }
      }
      $scope.victims = JSON.parse(StatusFactory.get('victims'));
      for (var i=0; i<$scope.students.length; i++) {
        if ($scope.victims != null) {
          $scope.students[i].victim = $scope.victims.indexOf($scope.students[i]._id) != -1;
        } else {
          $scope.students[i].victim = false;
        }
      }
      if ($scope.victims) {
        if($scope.victims.indexOf($scope.userProfile._id)==-1){
          $scope.isSelf = false;
        } else {
          $scope.isSelf = true;
        }
      }
    }, function(error) {
    }
  );

  $scope.victims=[];
  $scope.add = function(item, value, offender, witness){
    if (!offender && !witness) {
      if (value) {
        if ($scope.victims == null) {
          $scope.victims=[];
        }
        if($scope.victims.indexOf(item._id) == -1){
          $scope.victims.push(item._id);
        }
      } else {
        $scope.victims.splice($scope.victims.indexOf(item._id), 1);
      }
      if($scope.victims.indexOf($scope.userProfile._id)==-1){
        $scope.isSelf = false;
      } else {
        $scope.isSelf = true;
      }
      // console.log("victims : "+$scope.victims);
    }
  };
  $scope.save = function() {
    if ($scope.isSelf) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirmación de Víctima',
        content: '<ion-checkbox ng-model="flags.student_intervene">¿Algún otro <br>estudiante intervino?</ion-checkbox><ion-checkbox ng-model="flags.official_intervene">¿Intervinieron los <br> funcionarios <br>escolares?</ion-checkbox>',
        scope: $scope,
        buttons: [
          { text: 'Cancelar', onTap: function(e) { return false; } },
          {
            text: 'OK',
            type: 'button-positive',
            onTap: function(e) { return true; }
          }
        ]
      });
      confirmPopup.then(function(res) {
        if(res) {
          SaveFactory.save('student_intervene',$scope.flags.student_intervene);
          SaveFactory.save('official_intervene',$scope.flags.official_intervene);
          SaveFactory.save('victims', $scope.victims);
          $state.go('tabs-controller.dashboard-report', {}, {reload: true});
        }
      });
    } else {
      SaveFactory.save('student_intervene', 'null');
      SaveFactory.save('official_intervene', 'null');
      SaveFactory.save('victims', $scope.victims);
      $state.go('tabs-controller.dashboard-report', {}, {reload: true});
    }
  }
}])

.controller('whoSawItCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate', '$ionicPopup', 'AuthService', 'StudentService', 'SaveFactory', 'AuthService', 'StatusFactory', '$state',
function ($scope, $stateParams, $ionicSideMenuDelegate, $ionicPopup, AuthService, StudentService, SaveFactory, AuthService, StatusFactory, $state) {
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);

  $scope.students=[];
  $scope.witness=[];

  $scope.userProfile = AuthService.userProfile();

  $scope.isSelf = false;
  $scope.flags = { intervene: false, aware: false };

  StudentService.setStudents().then(
    function(success) {
      $scope.students = success;
      $scope.offenders = JSON.parse(StatusFactory.get('offender'));
      for (var i=0; i<$scope.students.length; i++) {
        if ($scope.offenders != null) {
          $scope.students[i].offender = $scope.offenders.indexOf($scope.students[i]._id)!=-1;
        } else {
          $scope.students[i].offender = false;
        }
      }
      $scope.victims = JSON.parse(StatusFactory.get('victims'));
      for (var i=0; i<$scope.students.length; i++) {
        if ($scope.victims != null) {
          $scope.students[i].victim = $scope.victims.indexOf($scope.students[i]._id)!=-1;
        } else {
          $scope.students[i].victim = false;
        }
      }
      $scope.witness = JSON.parse(StatusFactory.get('witness'));
      for (var i=0; i<$scope.students.length; i++) {
        if ($scope.witness != null) {
          $scope.students[i].witness = $scope.witness.indexOf($scope.students[i]._id)!=-1;
        } else {
          $scope.students[i].witness = false;
        }
      }
      if ($scope.witness) {
        if($scope.witness.indexOf($scope.userProfile._id)==-1){
          $scope.isSelf = false;
        } else {
          $scope.isSelf = true;
        }
      }
    }, function(error) {
    }
  );

  $scope.add = function(item, value, offender, victim){
    if (!offender && !victim) {
      if (value) {
        if ($scope.witness == null) {
          $scope.witness=[];
        }
        if($scope.witness.indexOf(item._id)==-1){
          $scope.witness.push(item._id);
        }
      } else {
        $scope.witness.splice($scope.witness.indexOf(item._id), 1);
      }
      if($scope.witness.indexOf($scope.userProfile._id)==-1){
        $scope.isSelf = false;
      } else {
        $scope.isSelf = true;
      }
      // console.log("witness : "+$scope.witness);
    }
  };
  $scope.save = function() {
    if ($scope.isSelf) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirmación de testigos',
      content: '<ion-checkbox ng-model="flags.intervene">¿Ha intervenido en<br> el incidente?</ion-checkbox><ion-checkbox ng-model="flags.aware">¿La víctima o las <br>víctimas son <br>conscientes del <br>incidente?</ion-checkbox>',
      scope: $scope,
      buttons: [
        { text: 'Cancelar', onTap: function(e) { return false; } },
        {
          text: 'OK',
          type: 'button-positive',
          onTap: function(e) { return true; }
        }
      ]
    });

    confirmPopup.then(function(res) {
        if (res) {
          SaveFactory.save('self_intervened',$scope.flags.intervene);
          SaveFactory.save('victim_aware',$scope.flags.aware);
          SaveFactory.save('witness',$scope.witness);
          $state.go('tabs-controller.dashboard-report', {}, {reload: true});
       }
     });
   } else {
     SaveFactory.save('self_intervened', 'null');
     SaveFactory.save('victim_aware', 'null');
     if (!$scope.witness) {
       $scope.witness = [];
     }
     SaveFactory.save('witness',$scope.witness);
     $state.go('tabs-controller.dashboard-report', {}, {reload: true});
   }
 }
}])

.controller('whereHappenedCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate', 'PlaceService', 'SaveFactory', '$state',
function ($scope, $stateParams, $ionicSideMenuDelegate, PlaceService, SaveFactory, $state) {
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);

  $scope.places=[];

  PlaceService.setPlaces().then(
    function(success) {
      $scope.places = success;
    }, function(error) {

    }
  );

  PlaceService.setPlacesAsync().then(
    function(success) {
      $scope.places = success;
    }, function(error) {
    }
  );
  $scope.save = function(item){
    SaveFactory.save('place_type',item._id);
    $state.go('tabs-controller.dashboard-report', {}, {reload: true});
  }
}])

.controller('whenHappenedCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate', 'StatusFactory', 'SaveFactory', '$state', '$ionicPopup',
function ($scope, $stateParams, $ionicSideMenuDelegate, StatusFactory, SaveFactory, $state, $ionicPopup) {
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);

  var date = new Date();
  date.setDate(date.getDate() - 7);
  $scope.minDate = date.toISOString().split('T')[0];

  $scope.timeValue = JSON.parse(StatusFactory.get('time'));
  $scope.dateValue = JSON.parse(StatusFactory.get('date'));

  $scope.save = function(dateValue, timeValue){
    SaveFactory.save('date',dateValue);
    SaveFactory.save('time',timeValue);

    console.log(new Date().toISOString());

    var dVal = new Date(dateValue).toISOString();
    var tVal = new Date(timeValue).toISOString();
    var datetime = (new Date(new Date(dVal.split('T')[0] + 'T' + tVal.split('T')[1]).getTime() + 24 * 3600 * 1000)).toISOString();
    console.log(datetime);
    SaveFactory.save('datetime', datetime);
    if (new Date(datetime) < new Date()) {
      console.log("true");
      $state.go('tabs-controller.dashboard-report', {}, {reload: true});
    } else {
      var alertPopup = $ionicPopup.alert({
        title: 'Hora no válida.',
        template: ''
      });
    }
  }
}])

.controller('offenderCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate', 'OffenderService', '$state', 'AuthService',
function ($scope, $stateParams, $ionicSideMenuDelegate, OffenderService, $state, AuthService) {
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);

  $scope.cases=[];

  $scope.userProfile = AuthService.userProfile();

  OffenderService.setCases().then(
    function(success) {
      for (var i = 0; i < success.length; i++) {
        success[i].res_req = false;
        for (var j = 0; j < success[i].offenders.length; j++) {
          if (success[i].offenders[j].student._id === $scope.userProfile._id) {
            if (success[i].offenders[j].answers.length == 0) {
              success[i].res_req = true;
            }
          }
        }
      }
      $scope.cases = success;
    }, function(error) {
    }
  );

  OffenderService.setCasesAsync().then(
    function(success) {
      for (var i = 0; i < success.length; i++) {
        success[i].res_req = false;
        for (var j = 0; j < success[i].offenders.length; j++) {
          if (success[i].offenders[j].student._id === $scope.userProfile._id) {
            if (success[i].offenders[j].answers.length == 0) {
              success[i].res_req = true;
            }
          }
        }
      }
      $scope.cases = success;
      // console.log(success);
    }, function(error) {
    }
  );
  $scope.respond = function(offender_case) {
    for (var i = 0; i < offender_case.offenders.length; i++) {
      if (!$scope.userProfile) {
        $scope.userProfile = AuthService.userProfile();
      }
      if (offender_case.offenders[i].student._id === $scope.userProfile._id) {
        var answers = JSON.stringify(offender_case.offenders[i].answers);
      }
    }
    $state.go('problem-response', {id:offender_case._id, name:offender_case.incidenttype.title, desc:offender_case.incidenttype.description, answers:answers}, {reload: true});
  }
}])

.controller('witnessedCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate', 'ReportService',
function ($scope, $stateParams, $ionicSideMenuDelegate, ReportService) {
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);

  $scope.cases = [];
  $scope.places = [];

  ReportService.setTopThreePecons().then(
    function(success) {
      $scope.cases = success;
      ReportService.setPeconPlaces().then(
        function(success) {
          $scope.places = success;
        }, function(error) {
        }
      )
      $scope.numCases = ReportService.totalCases();
      $scope.solidarityIndex = ReportService.solidarityIndex();
    }, function(error) {
    }
  );




}])

.controller('reportedCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate', 'OffenderService',
function ($scope, $stateParams, $ionicSideMenuDelegate, OffenderService) {
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);

  $scope.num_cases = 0;

  $scope.cases=[];

  OffenderService.setCases().then(
    function(success) {
      $scope.cases = success;
      $scope.num_cases = success.length;
    }, function(error) {
    }
  );

  OffenderService.setCasesAsync().then(
    function(success) {
      $scope.cases = success;
      $scope.num_cases = success.length;
    }, function(error) {
    }
  );

}])

.controller('problemResponseCtrl', ['$scope', '$stateParams', '$ionicSideMenuDelegate', 'OffenderService', 'QuestionService', '$state',
function ($scope, $stateParams, $ionicSideMenuDelegate, OffenderService, QuestionService, $state) {
  $scope.$root.showMenuIcon = true;
  $ionicSideMenuDelegate.canDragContent(true);

  $scope.responded = false;
  $scope.answers = JSON.parse($stateParams.answers)
  if ($scope.answers.length > 0) {
    $scope.responded = true;
  }

  QuestionService.setQuestions().then(
    function(success) {
      $scope.questions = success;
      for (var i = 0; i < $scope.questions.length; i++) {
        $scope.questions[i].answer = undefined;
        for (var j = 0; j < $scope.answers.length; j++) {
          if ($scope.answers[j].question._id === $scope.questions[i]._id) {
            $scope.questions[i].answer = $scope.answers[j].answer;
          }
        }
      }
    }, function(error) {
    }
  );

  $scope.casename = $stateParams.name;
  $scope.casedesc = $stateParams.desc;
  $scope.answer = function() {
    var answers = [];
    for (var i = 0; i < $scope.questions.length; i++) {
      answers.push({answer: $scope.questions[i].answer, question: $scope.questions[i]._id});
    }
    OffenderService.setResponse($stateParams.id, answers).then(
      function(success) {
        $state.go('problems', {}, {reload: true, notify:true});
      }, function (error) {
        $state.go('problems', {}, {reload: true, notify:true});
      }
    )
  }
}])
