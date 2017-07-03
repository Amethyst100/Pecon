angular.module('app')

  .constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated'
  })
  // .constant('URL', 'http://localhost:8836/api');
  .constant('URL', 'https://pecon.herokuapp.com/api');
