/**
 * Module dependencies.
 */
var http = require('http')
  , req = http.IncomingMessage.prototype;


req.authenticate = function() {
  // TODO: Implement this function (by calling this._passport.instance.authenticate)
}

req.login =
req.logIn = function(user, options, done) {
  if (!this._passport) throw new Error('passport.initialize() middleware not in use');
  
  if (!done && typeof options === 'function') {
    done = options;
    options = {};
  }
  options = options || {};
  var session = (options.session === undefined) ? false : options.session;
  
  req.user = user;
  if (session) {
    var self = this;
    this._passport.instance.serializeUser(user, function(err, obj) {
      if (err) { return done(err); }
      self._passport.session.user = obj;
      done();
    });
  } else {
    done();
  }
}

req.logout =
req.logOut = function() {
  if (!this._passport) throw new Error('passport.initialize() middleware not in use');
  req.user = null;
  delete this._passport.session.user;
};

/**
 * Test if request is authenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isAuthenticated = function() {
  if (!this._passport) throw new Error('passport.initialize() middleware not in use');
  // FIXME: This should test against this.user, in case sessions are not in use.
  return (this._passport.session && this._passport.session.user) ? true : false;
};

/**
 * Test if request is unauthenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isUnauthenticated = function() {
  return !this.isAuthenticated();
};
