angular.module('app.services', [])

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({ 401: AUTH_EVENTS.notAuthenticated }[response.status], response);
      return $q.reject(response);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})

.service('AuthService', function($q, $http, URL, jwtHelper) {
  var LOCAL_TOKEN_KEY = 'token';
  var LOCAL_PROFILE_KEY = 'profile';
  var LOCAL_CASES_KEY = 'offendercases';
  var userId = '';
  var isAuthenticated = false;
  var authToken;

  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    var profile = JSON.parse(window.localStorage.getItem(LOCAL_PROFILE_KEY));
    // console.log(profile);
    var _id = (profile ? profile._id : '');
    if (token) {
      useCredentials(_id, token);
    }
  }

  function storeUserCredentials(profile, token) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    useCredentials(profile._id, token);
  }

  function useCredentials(_id, token) {
    userId = _id;
    isAuthenticated = true;

    // Set the token as header for your requests!
    $http.defaults.headers.common['Authorization'] = token;
  }

  function destroyUserCredentials() {
    authToken = undefined;
    userId = '';
    isAuthenticated = false;
    $http.defaults.headers.common['Authorization'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    window.localStorage.removeItem(LOCAL_PROFILE_KEY);
    window.localStorage.clear();
  }

  var login = function(username, pass) {
    return $q(function(resolve, reject) {
      var link = URL + '/authenticate/student';
      // var link = 'https://pecon.herokuapp.com/api/authenticate/student';
      $http.post(link, {roll_number: username, password: pass}).then(function (res) {
        var tokenPayload = jwtHelper.decodeToken(res.data.token);
        // console.log(tokenPayload);
        storeUserCredentials(tokenPayload, res.data.token);
        resolve(true);
      }, function(error) {
        reject(true);
        // console.log(error);
      });
    });
  };

  var logout = function() {
    destroyUserCredentials();
  };

  loadUserCredentials();

  return {
    login: login,
    logout: logout,
    isAuthenticated: function() { return isAuthenticated; },
    userId: function() { return userId; },
    userProfile: function() { return JSON.parse(window.localStorage.getItem(LOCAL_PROFILE_KEY)); }
  };
})

.service('IncidentService', function($q, $http, URL) {
  var LOCAL_INCIDENTS_KEY = 'incidents';

  function loadIncidents() {
    var incidents = window.localStorage.getItem(LOCAL_INCIDENTS_KEY);
    if (incidents) {
      return incidents;
    }
    return false;
  }

  function storeIncidents(incidents) {
    window.localStorage.setItem(LOCAL_INCIDENTS_KEY, incidents);
  }

  function destroyIncidents() {
    window.localStorage.removeItem(LOCAL_INCIDENTS_KEY);
  }

  var setIncidents = function() {
    return $q(function(resolve, reject) {
      if (loadIncidents()) {
        resolve(JSON.parse(loadIncidents()));
      } else {
        reject(true);
      }
    });
  };

  var setIncidentsAsync = function() {
    return $q(function(resolve, reject) {
      var link = URL + '/incidentType';
      $http.get(link, {headers: {Authorization: window.localStorage.getItem('token')}}).then(
        function (res) {
          storeIncidents(JSON.stringify(res.data.types));
          resolve(res.data.types);
        }, function(error) {
          reject(true);
        }
      );
    });
  };

  var unsetIncidents = function() {
    destroyIncidents();
  };

  loadIncidents();

  return {
    setIncidents: setIncidents,
    unsetIncidents: unsetIncidents,
    setIncidentsAsync: setIncidentsAsync
  };
})

.service('StudentService', function($q, $http, URL) {
  var LOCAL_STUDENTS_KEY = 'students';

  function loadStudents() {
    var students = window.localStorage.getItem(LOCAL_STUDENTS_KEY);
    if (students) {
      return students;
    }
    return false;
  }

  function storeStudents(students) {
    window.localStorage.setItem(LOCAL_STUDENTS_KEY, students);
  }

  function destroyStudents() {
    window.localStorage.removeItem(LOCAL_STUDENTS_KEY);
  }

  var setStudents = function() {
    return $q(function(resolve, reject) {
      if (loadStudents()) {
        resolve(JSON.parse(loadStudents()));
      }
      var link = URL + '/student';
      $http.get(link, {headers: {Authorization: window.localStorage.getItem('token')}}).then(function (res){
          // console.log(JSON.stringify(res.data.students));
          storeStudents(JSON.stringify(res.data.students));
          resolve(res.data.students);
        },function(error) {
          // console.log(JSON.stringify(error));
          reject(true);
        });
    });
  };

  var unsetStudents = function() {
    destroyStudents();
  };

  loadStudents();

  return {
    setStudents: setStudents,
    unsetStudents: unsetStudents
  };
})

.service('PlaceService', function($q, $http, URL) {
  var LOCAL_INCIDENTS_KEY = 'places';

  function loadPlaces() {
    var places = window.localStorage.getItem(LOCAL_INCIDENTS_KEY);
    if (places) {
      return places;
    }
    return false;
  }

  function storePlaces(places) {
    window.localStorage.setItem(LOCAL_INCIDENTS_KEY, places);
  }

  function destroyPlaces() {
    window.localStorage.removeItem(LOCAL_INCIDENTS_KEY);
  }

  var setPlaces = function() {
    return $q(function(resolve, reject) {
      if (loadPlaces()) {
        resolve(JSON.parse(loadPlaces()));
      } else {
        reject(true);
      }
    });
  };

  var setPlacesAsync = function() {
    return $q(function(resolve, reject) {
      var link = URL + '/place';
      $http.get(link, {headers: {Authorization: window.localStorage.getItem('token')}}).then(function (res) {
        storePlaces(JSON.stringify(res.data.places));
        resolve(res.data.places);
      },function(error) {
        reject(true);
      });
    });
  };

  var unsetPlaces = function() {
    destroyPlaces();
  };

  loadPlaces();

  return {
    setPlaces: setPlaces,
    unsetPlaces: unsetPlaces,
    setPlacesAsync: setPlacesAsync
  };
})

.service('PeconService', function($q, $http, URL) {

  function getCaseData() {
    return {
      "incidenttype": JSON.parse(window.localStorage.getItem('incident_type')),
      "incidentplace": JSON.parse(window.localStorage.getItem('place_type')),
      "offenders": JSON.parse(window.localStorage.getItem('offender')),
      "victims": JSON.parse(window.localStorage.getItem('victims')),
      "witnesses": JSON.parse(window.localStorage.getItem('witness')),
      "incidentdatetime": JSON.parse(window.localStorage.getItem('datetime')),
      // "time": JSON.parse(window.localStorage.getItem('time')),
      // "date": JSON.parse(window.localStorage.getItem('date')),
      // "intervened": JSON.parse(window.localStorage.getItem('intervened')),
      // "aware": JSON.parse(window.localStorage.getItem('aware'))
      "self_intervened": JSON.parse(window.localStorage.getItem('self_intervened')),
      "victim_aware": JSON.parse(window.localStorage.getItem('victim_aware')),
      "student_intervene": JSON.parse(window.localStorage.getItem('student_intervene')),
      "official_intervene": JSON.parse(window.localStorage.getItem('official_intervene'))
    };
  }

  function formatData(caseData) {
    if (caseData.witnesses) {
      var temp = [];
      for (var i = 0; i < caseData.witnesses.length; i++) {
        temp.push({student: caseData.witnesses[i]});
      }
      caseData.witnesses = temp;
    }
    if (caseData.offenders) {
      var temp = [];
      for (var i = 0; i < caseData.offenders.length; i++) {
        temp.push({student: caseData.offenders[i]});
      }
      caseData.offenders = temp;
    }
    if (caseData.victims) {
      var temp = [];
      for (var i = 0; i < caseData.victims.length; i++) {
        temp.push({student: caseData.victims[i]});
      }
      caseData.victims = temp;
    }
    var questions = JSON.parse(window.localStorage.getItem('questions'));

    caseData.answers = [];

    var aware_question = 0;
    var intervened_question = 0;
    var student_intervened = 0;
    var official_intervened = 0;
    if (questions) {
      for (var i = 0; i < questions.length; i++) {
        if (questions[i].title === 'Aware') {
          var aware_question = questions[i];
        } else if (questions[i].title === 'Intervene') {
          var intervened_question = questions[i];
        } else if (questions[i].title === 'StudentIntervene') {
          var student_intervened = questions[i];
        } else if (questions[i].title === 'OfficialIntervene') {
          var official_intervened = questions[i];
        }
      }

      if (caseData.victim_aware !== 'null') {
        caseData.answers.push({answer: caseData.victim_aware ? 'Yes':'No' ,question: aware_question._id});
      }
      if (caseData.self_intervened !== 'null') {
        caseData.answers.push({answer: caseData.self_intervened ? 'Yes':'No' ,question: intervened_question._id});
      }
      if (caseData.student_intervene !== 'null') {
        caseData.answers.push({answer: caseData.student_intervene ? 'Yes':'No' ,question: student_intervened._id});
      }
      if (caseData.official_intervene !== 'null') {
        caseData.answers.push({answer: caseData.official_intervene ? 'Yes':'No' ,question: official_intervened._id});
      }
    }
    return caseData;
  }

  var submitCase = function() {
    return $q(function(resolve, reject) {
      var link = URL + '/incident';
      var caseData = formatData(getCaseData());
      var caseDataParams = JSON.stringify(caseData);
      // console.log(caseData);
      $http.post(link, caseDataParams, {headers: {Authorization: window.localStorage.getItem('token')}}).then(
        function (res) {
          // console.log(JSON.stringify(res.data));
          caseData._id = res.data.incident_id;
          resolve(caseData);
          resetReport();
        } ,function(error) {
          reject(true);
        }
      );
    });
  };

  function resetReport() {
    window.localStorage.removeItem('incident_type');
    window.localStorage.removeItem('place_type');
    window.localStorage.removeItem('offender');
    window.localStorage.removeItem('victims');
    window.localStorage.removeItem('witness');
    window.localStorage.removeItem('time');
    window.localStorage.removeItem('date');
  }

  return {
    submitCase: submitCase,
    resetReport: resetReport
  };
})

.service('OffenderService', function($q, $http, URL) {
  var LOCAL_CASES_KEY = 'offendercases';

  function loadCases() {
    var cases = window.localStorage.getItem(LOCAL_CASES_KEY);
    if (cases) {
      return cases;
    }
    return false;
  }

  function storeCases(cases) {
    window.localStorage.setItem(LOCAL_CASES_KEY, cases);
  }

  function destroyCases() {
    window.localStorage.removeItem(LOCAL_CASES_KEY);
  }

  var setCases = function() {
    return $q(function(resolve, reject) {
      if(loadCases()){
        resolve(JSON.parse(loadCases()));
      }
    });
  };

  var setCasesAsync = function() {
    return $q(function(resolve, reject) {
        var link = URL + '/incidentsList/asOffender';
        $http.get(link).then(
          function (res){
            // console.log(res.data.incidents);
            for (var i = 0; i < res.data.incidents.length; i++) {
              var contains = false;
              for (var j = 0; j < res.data.incidents[i].victims.length; j++) {
                if (res.data.incidents[i].victims[j].student._id === res.data.incidents[i].reporters[0].student) {
                  contains = true;
                }
              }
              if (contains) {
                res.data.incidents.splice(i, 1);
                i--;
              }
            }
            // console.log(res.data.incidents);
            storeCases(JSON.stringify(res.data.incidents));
            resolve(res.data.incidents);
          }, function(error) {
            reject(true);
          }
        );
    });
  };

  function getResponse($id, $response) {
    return {
      "cid":$id,
      "response":$response
    }
  }

  var setResponse = function(id, answers) {
    return $q(function(resolve, reject) {
      var link = URL + '/incident/' + id;
      $http.put(link, {answers: answers}).then(function (res) {
        // console.log(res);
        resolve(true);
      }, function(error) {
        reject(true);
      });
    });
  };

  var unsetCases = function() {
    destroyCases();
  };

  loadCases();

  return {
    setCases: setCases,
    unsetCases: unsetCases,
    setResponse: setResponse,
    setCasesAsync: setCasesAsync
  };
})

.service('QuestionService', function($q, $http, URL) {
  var LOCAL_QUESTIONS_KEY = 'questions';

  function loadQuestions() {
    var places = window.localStorage.getItem(LOCAL_QUESTIONS_KEY);
    if (places) {
      return places;
    }
    return false;
  }

  function storeQuestions(places) {
    window.localStorage.setItem(LOCAL_QUESTIONS_KEY, places);
  }

  function destroyQuestions() {
    window.localStorage.removeItem(LOCAL_QUESTIONS_KEY);
  }

  var setQuestions = function() {
    return $q(function(resolve, reject) {
      if (loadQuestions()) {
        var questions = JSON.parse(loadQuestions());
        for (var i = 0; i < questions.length; i++) {
          questions[i].options = questions[i].options[0].split(',');
          if (questions[i].for !== 'offenders') {
            questions.splice(i, 1);
            i--;
          }
        }
        resolve(questions);
      }
      var link = URL + '/question';
      $http.get(link, {headers: {Authorization: window.localStorage.getItem('token')}}).then(function (res) {
        storeQuestions(JSON.stringify(res.data.questions));
        for (var i = 0; i < res.data.questions.length; i++) {
          res.data.questions[i].options = res.data.questions[i].options[0].split(',');
          if (res.data.questions[i].for !== 'offenders') {
            res.data.questions.splice(i, 1);
            i--;
          }
        }
        resolve(res.data.questions);
      },function(error) {
        reject(true);
      });
    });
  };

  var setReporterQuestions = function() {
    return $q(function(resolve, reject) {
      if (loadQuestions()) {
        var questions = JSON.parse(loadQuestions());
        for (var i = 0; i < questions.length; i++) {
          questions[i].options = questions[i].options[0].split(',');
          if (questions[i].for !== 'reporters') {
            questions.splice(i, 1);
            i--;
          }
        }
        resolve(questions);
      }
      var link = URL + '/question';
      $http.get(link, {headers: {Authorization: window.localStorage.getItem('token')}}).then(function (res) {
        storeQuestions(JSON.stringify(res.data.questions));
        for (var i = 0; i < res.data.questions.length; i++) {
          res.data.questions[i].options = res.data.questions[i].options[0].split(',');
          if (res.data.questions[i].for !== 'reporters') {
            res.data.questions.splice(i, 1);
            i--;
          }
        }
        resolve(res.data.questions);
      },function(error) {
        reject(true);
      });
    });
  };

  var unsetQuestions = function() {
    destroyPlaces();
  };

  loadQuestions();

  return {
    setQuestions: setQuestions,
    setReporterQuestions: setReporterQuestions,
    unsetQuestions: unsetQuestions
  };
})

.service('ReportService', function($q, $http, URL) {
  var LOCAL_CASES_KEY = 'cases';
  var LOCAL_LAST_UPDATED_KEY = 'lastUpdated';

  function loadCases() {
    var cases = window.localStorage.getItem(LOCAL_CASES_KEY);
    if (cases) {
      return cases;
    }
    return false;
  }

  function storeCases(cases) {
    window.localStorage.setItem(LOCAL_CASES_KEY, cases);
  }

  function loadLastUpdated() {
    var date = window.localStorage.getItem(LOCAL_LAST_UPDATED_KEY);
    if (date) {
      return date;
    }
    return false;
  }

  function storeLastUpdated(date) {
    window.localStorage.setItem(LOCAL_LAST_UPDATED_KEY, date);
  }

  function destroyCases() {
    window.localStorage.removeItem(LOCAL_CASES_KEY);
  }

  function contains (places, place) {
    for (var i = 0; i < places.length; i++) {
      if (places[i]._id === place._id) {
        return true;
      }
    }
    return false;
  }

  // var setStoredPecons = function() {
  //   return $q(function(resolve, reject) {
  //     var cases = loadCases();
  //     if (cases) {
  //       cases = JSON.parse(cases);
  //       cases.length = 3;
  //       resolve(cases);
  //     }
  //   });
  // };

  var setTopThreePecons = function() {
    return $q(function(resolve, reject) {
      // var cases = loadCases();
      // if (cases) {
      //   cases = JSON.parse(cases);
      //   cases.length = 3;
      //   resolve(cases);
      // }
      var lastUpdate = loadLastUpdated();
      var daysLastUpdate = Math.round(Math.abs((new Date().getTime() - parseInt(lastUpdate)) / (24 * 60 * 60 * 1000)));
      // console.log(daysLastUpdate);
      // console.log(Math.round(Math.abs((new Date().getTime() - (new Date().getTime() - 7 * 24 * 60 *60 * 1000))/(24 * 60 * 60 * 1000))));
      if (daysLastUpdate > 7 || (daysLastUpdate <=7 && new Date().getDay() == 3)) {
        var link = URL + '/incidentsDate';
        var lastWeek = new Date(new Date().getTime() - 7 * 24 * 60 *60 * 1000).toISOString();
        var nowDate = new Date().toISOString();
        var params = "?fromDate=" + lastWeek + "&toDate=" + nowDate;
        // console.log(params);
        $http.get(link + params, {headers: {Authorization: window.localStorage.getItem('token')}}).then(function (res) {
          storeCases(JSON.stringify(res.data.incidents));
          // console.log(res);
          // console.log(new Date().getDay());
          storeLastUpdated(JSON.stringify(new Date().getTime()));
          // console.log(new Date(new Date().getTime() + 7 * 24 * 60 *60 * 1000).toISOString());
          res.data.incidents.length = 3;
          resolve(res.data.incidents);
        }, function(error) {
          reject(true);
        });
      } else {
        var cases = loadCases();
        if (cases) {
          cases = JSON.parse(cases);
          cases.length = 3;
          resolve(cases);
        }
      }
    });
  };

  var setPeconPlaces = function() {
    return $q(function(resolve, reject) {
      var cases = loadCases();
      if (cases) {
        cases = JSON.parse(cases);
        var places = [];
        for (var i = 0; i < cases.length; i++) {
          if (!contains(places, cases[i].incidentplace)) {
            places.push(cases[i].incidentplace);
          }

          places.sort(function(a, b){
              a = parseInt(a['timesReported']);
              b = parseInt(b['timesReported']);
              return b - a;
          });
        }
        places.length = 5;
        resolve(places);
      } else {
        reject(true);
      }
    });
  };

  var solidarityIndex = function () {
    var numCasesAsVictim = 0;
    var numCasesAsWitness = 0;
    var cases = loadCases();
    if (cases) {
      cases = JSON.parse(cases);
      for (var i = 0; i < cases.length; i++) {
        for (var j = 0; j < cases[i].victims.length; j++) {
          if (cases[i].reporters[0].student._id === cases[i].victims[j].student._id) {
            numCasesAsVictim++;
          }
        }

        for (var j = 0; j < cases[i].witnesses.length; j++) {
          if (cases[i].reporters[0].student._id === cases[i].witnesses[j].student._id) {
            numCasesAsWitness++;
          }
        }
      }
      var w = parseFloat(numCasesAsWitness, 3);
      var v = parseFloat(numCasesAsVictim, 3);
      var sIndex = w/v;
      return sIndex;
    }
  }

  var unsetCases = function() {
    destroyCases();
  };

  loadCases();

  return {
    setTopThreePecons: setTopThreePecons,
    setPeconPlaces: setPeconPlaces,
    unsetCases: unsetCases,
    totalCases: function () { return JSON.parse(loadCases()).length; },
    solidarityIndex: solidarityIndex
  }
})

.factory('SaveFactory', function () {
  return {
    save: function(key, value) {
      return window.localStorage.setItem(key, JSON.stringify(value));
    }
  };
})

.factory('StatusFactory', function () {
  return {
    get: function(key) {
      return window.localStorage.getItem(key);
    }
  };
});
