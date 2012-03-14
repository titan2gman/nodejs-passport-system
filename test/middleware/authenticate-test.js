var vows = require('vows');
var assert = require('assert');
var passport = require('passport');
var util = require('util');
var Passport = require('passport').Passport;


function MockSuccessStrategy() {
}

MockSuccessStrategy.prototype.authenticate = function(req, options) {
  var user = { id: '1', username: 'jaredhanson' };
  if (options && options.scope && options.scope === 'email') {
    user.email = 'jaredhanson@example.com';
  }
  
  this.success(user, { message: 'Success!' });
}

function MockFailureStrategy() {
}

MockFailureStrategy.prototype.authenticate = function(req) {
  this.fail();
}

function MockFailureInfoStrategy() {
}

MockFailureInfoStrategy.prototype.authenticate = function(req) {
  this.fail({ message: 'Invalid password' });
}

function MockChallengeStrategy() {
}

MockChallengeStrategy.prototype.authenticate = function(req) {
  this.fail('Mock challenge');
}

function MockForbiddenStrategy() {
}

MockForbiddenStrategy.prototype.authenticate = function(req) {
  this.fail('Mock challenge', 403);
}

function MockBadRequestStrategy() {
}

MockBadRequestStrategy.prototype.authenticate = function(req) {
  this.fail(400);
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
  this._headers = {};
}

MockResponse.prototype.setHeader = function(name, value) {
  this._headers[name] = value;
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
      'should not set email on user according to scope' : function(err, req, res) {
        assert.isUndefined(req.user.email);
      },
    },
  },
  
  'with a successful authentication passing options to strategy': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy());
      return passport.authenticate('success', { scope: 'email' });
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
      'should set email on user according to scope' : function(err, req, res) {
        assert.equal(req.user.email, 'jaredhanson@example.com');
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
  
  'with a successful authentication and assignProperty option': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      return passport.authenticate('success', { assignProperty: 'account' });
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
      'should not set user on request' : function(err, req, res) {
        assert.isUndefined(req.user);
      },
      'should set account on request' : function(err, req, res) {
        assert.isObject(req.account);
        assert.equal(req.account.id, '1');
        assert.equal(req.account.username, 'jaredhanson');
      },
    },
  },
  
  'with a successful authentication and callback': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('success', new MockSuccessStrategy);
      var callback = function(err, user, info) {
        this.done(err, user, info);
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
        context.done = function(err, user, info) {
          self.callback(err, req, res, user, info);
        }
        
        function next(err) {
          self.callback(new Error('should not be called'));
        }
        process.nextTick(function () {
          authenticate(req, res, next)
        });
      },
      
      'should not generate an error' : function(err, req, res, user, info) {
        assert.isNull(err);
      },
      'should not set user on request' : function(err, req, res, user, info) {
        assert.isUndefined(req.user);
      },
      'should pass user to callback' : function(err, req, res, user, info) {
        assert.isObject(user);
        assert.equal(user.id, '1');
        assert.equal(user.username, 'jaredhanson');
      },
      'should pass profile to callback' : function(err, req, res, user, info) {
        assert.isObject(info);
        assert.equal(info.message, 'Success!');
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
  
  'with a failed authentication containing info and callback': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('failure', new MockFailureInfoStrategy());
      var callback = function(err, user, info) {
        this.done(err, user, info);
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
        context.done = function(err, user, info) {
          self.callback(err, req, res, user, info);
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
      'should pass info to callback' : function(err, req, res, user, info) {
        assert.isObject(info);
        assert.equal(info.message, 'Invalid password');
      },
    },
  },
  
  'with a challenged authentication': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('challenge', new MockChallengeStrategy());
      return passport.authenticate('challenge');
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
      'should set WWW-Authenticate to challenge' : function(err, req, res) {
        assert.equal(res._headers['WWW-Authenticate'], 'Mock challenge');
      },
    },
  },
  
  'with a challenged authentication and status code': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('forbidden', new MockForbiddenStrategy());
      return passport.authenticate('forbidden');
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
        assert.equal(res.statusCode, 403);
      },
      'should set WWW-Authenticate to challenge' : function(err, req, res) {
        assert.equal(res._headers['WWW-Authenticate'], 'Mock challenge');
      },
    },
  },
  
  'with a failed authentication due to bad request': {
    topic: function() {
      var self = this;
      var passport = new Passport();
      passport.use('bad-request', new MockBadRequestStrategy());
      return passport.authenticate('bad-request');
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
      'should set status code to bad request' : function(err, req, res) {
        assert.equal(res.statusCode, 400);
      },
      'should not set WWW-Authenticate header' : function(err, req, res) {
        assert.isUndefined(res._headers['WWW-Authenticate']);
      },
    },
  },
  
}).export(module);
