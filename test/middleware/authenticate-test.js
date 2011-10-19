var vows = require('vows');
var assert = require('assert');
var passport = require('passport');
var util = require('util');
var Passport = require('passport').Passport;


function MockSuccessStrategy() {
}

MockSuccessStrategy.prototype.authenticate = function(req) {
  this.success({ id: '1', username: 'jaredhanson' }, { location: 'Oakland, CA' });
}

function MockFailureStrategy() {
}

MockFailureStrategy.prototype.authenticate = function(req) {
  this.fail();
}

function MockRequest() {
}

MockRequest.prototype.logIn = function(user, options, done) {
  if (this.loginError) {
    done(new Error('login error'));
  } else {
    this.user = user;
    done();
  }
}

function MockResponse() {
}


vows.describe('authenticate').addBatch({
  
  'with a successful authentication': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy());
      return passport.authenticate('success');
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
    },
  },
  
  'with a successful authentication but failed login': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy());
      return passport.authenticate('success');
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        req.loginError = true;
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.instanceOf(err, Error);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
    },
  },
  
  'with a successful authentication and redirect option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      return passport.authenticate('success', { successRedirect: 'http://www.example.com/account' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should set user on request' : function(err, req, res) {
        assert.isObject(req.user);
        assert.equal(req.user.id, '1');
        assert.equal(req.user.username, 'jaredhanson');
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/account');
      },
    },
  },
  
  'with a successful authentication and callback': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      var callback = function(err, user, profile) {
        this.done(err, user, profile);
      }
      var context = {};
      
      var authenticate = passport.authenticate('success', callback.bind(context));
      process.nextTick(function () {
        self.callback(null, authenticate, context);
      });
    },
    
    'when handling a request': {
      topic: function(authenticate, context) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        context.done = function(err, user, profile) {
          self.callback(err, req, res, user, profile);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res, user, profile) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res, user, profile) {
        assert.isUndefined(req.user);
      },
      'should pass user to callback' : function(err, req, res, user, profile) {
        assert.isObject(user);
        assert.equal(user.id, '1');
        assert.equal(user.username, 'jaredhanson');
      },
      'should pass profile to callback' : function(err, req, res, user, profile) {
        assert.isObject(profile);
        assert.equal(profile.location, 'Oakland, CA');
      },
    },
  },
  
  
  'with a failed authentication': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStrategy());
      return passport.authenticate('failure');
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        res.end = function() {
          self.callback(null, req, res)
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set status code to unauthorized' : function(err, req, res) {
        assert.equal(res.statusCode, 401);
      },
    },
  },
  
  'with a failed authentication and redirect option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStrategy());
      return passport.authenticate('failure', { failureRedirect: 'http://www.example.com/login' });
    },
    
    'when handling a request': {
      topic: function(authenticate) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        res.redirect = function(url) {
          this.location = url;
          self.callback(null, req, res);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should redirect response' : function(err, req, res) {
        assert.equal(res.location, 'http://www.example.com/login');
      },
    },
  },
  
  'with a failed authentication and callback': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureStrategy());
      var callback = function(err, user) {
        this.done(err, user);
      }
      var context = {};
      
      var authenticate = passport.authenticate('failure', callback.bind(context));
      process.nextTick(function () {
        self.callback(null, authenticate, context);
      });
    },
    
    'when handling a request': {
      topic: function(authenticate, context) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        context.done = function(err, user) {
          self.callback(err, req, res, user);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res, user) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res, user) {
        assert.isUndefined(req.user);
      },
      'should pass user to callback as false' : function(err, req, res, user) {
        assert.isFalse(user);
      },
    },
  },
  
}).export(module);
