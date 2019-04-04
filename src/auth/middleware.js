'use strict';

const User = require('./users-model.js');

module.exports = (req, res, next) => {
  
  try {
    let [authType, authString] = req.headers.authorization.split(/\s+/);
    
    switch( authType.toLowerCase() ) {
    case 'basic': 
      return _authBasic(authString);
    default: 
      return _authError();
    }
  }
  catch(e) {
    next(e);
  }
  
  /**
   * Takes in headers, checks with database if it's a authenticated user
   * @param {String} str 
   */
  function _authBasic(str) {
    // str: am9objpqb2hubnk=
    let base64Buffer = Buffer.from(str, 'base64'); // <Buffer 01 02 ...>
    let bufferString = base64Buffer.toString();    // john:mysecret
    let [username, password] = bufferString.split(':'); // john='john'; mysecret='mysecret']
    let auth = {username,password}; // { username:'john', password:'mysecret' }
    
    return User.authenticateBasic(auth)
      .then(user => _authenticate(user) )
      .catch(next);
  }
  /**
 * if valid user, creates token to communicate with to prevent further signins
 * @param {*} user 
 */
  function _authenticate(user) {
    if(user) {
      req.user = user;
      req.token = user.generateToken();
      next();
    }
    else {
      _authError();
    }
  }
  /**
   * If error in the authentication process, sends error
   */
  function _authError() {
    next('Invalid User ID/Password');
  }
  
};