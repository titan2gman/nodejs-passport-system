# Passport
[http://passportjs.org](http://passportjs.org)

Passport is an authentication framework for [Connect](http://senchalabs.github.com/connect/)
and [Express](http://expressjs.com/), which is extensible through "plugins"
known as _strategies_.

Passport is designed to be a general-purpose, yet simple, modular, and
unobtrusive, authentication framework.  Passport's sole purpose is to
authenticate requests.  In being modular, it doesn't force any particular
authentication strategy on your application.  In being unobtrusive, it doesn't
mount routes in your application.  The API is simple: you give Passport a
request to authenticate, and Passport provides hooks for controlling what occurs
when authentication succeeds or fails.

## Installation

    $ npm install passport

## Usage

#### Strategies

Passport uses the concept of strategies to authenticate requests.  Strategies
can range from verifying username and password credentials, delegated
authentication using [OAuth](http://oauth.net/) (for example, via [Facebook](http://www.facebook.com/)
or [Twitter](http://twitter.com/)), or federated authentication using [OpenID](http://openid.net/).

Before asking passport to authenticate a request, the strategy (or strategies)
used by an application must be configured.

    passport.use(new LocalStrategy(
      function(username, password, done) {
        User.findOne({ username: username, password: password }, function (err, user) {
          done(err, user);
        });
      }
    ));

#### Sessions

Passport will maintain persistent login sessions.  In order for persistent
sessions to work, the authenticated user must be serialized to the session, and
deserialized when subsequent requests are made.

Passport does not impose any restrictions on how your user records are stored.
Instead, you provide a function to Passport which implements the necessary
serialization and deserialization logic.  In typical applications, this will be
as simple as serializing the user ID, and finding the user by ID when
deserializing.

    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      User.findById(id, function (err, user) {
        done(err, user);
      });
    });

#### Connect/Express Middleware

To use Passport in a [Connect](http://senchalabs.github.com/connect/) or
[Express](http://expressjs.com/)-based application, configure it with the
required `passport.initialize()` middleware.  If your applications uses
persistent login sessions (recommended, but not required), `passport.session()`
middleware must also be used.

    app.configure(function() {
      app.use(express.cookieParser());
      app.use(express.bodyParser());
      app.use(express.session({ secret: 'keyboard cat' }));
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(app.router);
      app.use(express.static(__dirname + '/../../public'));
    });

#### Authenticate Requests

Passport provides an `authenticate()` function (which is standard
Connect/Express middleware), which is utilized to authenticate requests.

For example, it can be used as route middleware in an Express application:

    app.post('/login', 
      passport.authenticate('local', { failureRedirect: '/login' }),
      function(req, res) {
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-local/tree/master/examples/login)
included in [Passport-Local](https://github.com/jaredhanson/passport-local).

## Strategies

- [Local](https://github.com/jaredhanson/passport-local) (username and password)
- [BrowserID](https://github.com/jaredhanson/passport-browserid)
- [OpenID](https://github.com/jaredhanson/passport-openid)
- [OAuth](https://github.com/jaredhanson/passport-oauth) (OAuth 1.0 and 2.0)
- [SAML](https://github.com/bergie/passport-saml) by [Henri Bergius](https://github.com/bergie)
- [WebID](https://github.com/magnetik/passport-webid) by [Baptiste Lafontaine](https://github.com/magnetik)
- [37signals](https://github.com/jaredhanson/passport-37signals)
- [AngelList](https://github.com/jaredhanson/passport-angellist)
- [AOL](https://github.com/jaredhanson/passport-aol)
- [Bitbucket](https://github.com/jaredhanson/passport-bitbucket)
- [Digg](https://github.com/jaredhanson/passport-digg)
- [Dropbox](https://github.com/jaredhanson/passport-dropbox)
- [Dwolla](https://github.com/jaredhanson/passport-dwolla)
- [Evernote](https://github.com/jaredhanson/passport-evernote)
- [Facebook](https://github.com/jaredhanson/passport-facebook)
- [FamilySearch](https://github.com/jaredhanson/passport-familysearch)
- [Fitbit](https://github.com/jaredhanson/passport-fitbit)
- [Flattr](https://github.com/freenerd/passport-flattr) by [Johan Uhle](https://github.com/freenerd)
- [Flickr](https://github.com/johnnyhalife/passport-flickr) by [Johnny Halife](https://github.com/johnnyhalife)
- [Force.com](https://github.com/joshbirk/passport-forcedotcom) (Salesforce, Database.com) by [Joshua Birk](https://github.com/joshbirk)
- [Foursquare](https://github.com/jaredhanson/passport-foursquare)
- [FreedomWorks](https://github.com/carlos8f/passport-freedomworks) by [Carlos Rodriguez](https://github.com/carlos8f)
- [Geoloqi](https://github.com/jaredhanson/passport-geoloqi)
- [GitHub](https://github.com/jaredhanson/passport-github)
- [Goodreads](https://github.com/jaredhanson/passport-goodreads)
- [Google](https://github.com/jaredhanson/passport-google) (OpenID)
- [Google](https://github.com/jaredhanson/passport-google-oauth) (OAuth 1.0 and 2.0)
- [Gowalla](https://github.com/jaredhanson/passport-gowalla)
- [Instagram](https://github.com/jaredhanson/passport-instagram)
- [Intuit](https://github.com/jaredhanson/passport-intuit) (OpenID)
- [Intuit](https://github.com/jaredhanson/passport-intuit-oauth) (OAuth 1.0)
- [Justin.tv](https://github.com/jaredhanson/passport-justintv)
- [LinkedIn](https://github.com/jaredhanson/passport-linkedin)
- [Meetup](https://github.com/jaredhanson/passport-meetup)
- [Netflix](https://github.com/jaredhanson/passport-netflix)
- [Ohloh](https://github.com/jaredhanson/passport-ohloh)
- [OpenStreetMap](https://github.com/jaredhanson/passport-openstreetmap)
- [PayPal](https://github.com/jaredhanson/passport-paypal) (OpenID)
- [PayPal](https://github.com/jaredhanson/passport-paypal-oauth) (OAuth 2.0)
- [picplz](https://github.com/jaredhanson/passport-picplz)
- [Rdio](https://github.com/jaredhanson/passport-rdio)
- [Readability](https://github.com/jaredhanson/passport-readability)
- [RunKeeper](https://github.com/jaredhanson/passport-runkeeper)
- [SmugMug](https://github.com/jaredhanson/passport-smugmug)
- [SoundCloud](https://github.com/jaredhanson/passport-soundcloud)
- [StatusNet](https://github.com/zoowar/passport-statusnet) by [ZooWar](https://github.com/zoowar)
- [Steam](https://github.com/liamcurry/passport-steam) by [Liam Curry](https://github.com/liamcurry)
- [SUPINFO](https://github.com/godezinc/passport-supinfo) by [Vincent PEYROUSE](https://github.com/GodezInc)
- [TripIt](https://github.com/jaredhanson/passport-tripit)
- [Tumblr](https://github.com/jaredhanson/passport-tumblr)
- [Twitter](https://github.com/jaredhanson/passport-twitter)
- [Vimeo](https://github.com/jaredhanson/passport-vimeo)
- [VKontakte](https://github.com/stevebest/passport-vkontakte) by [Stepan Stolyarov](https://github.com/stevebest)
- [Windows Live](https://github.com/jaredhanson/passport-windowslive)
- [Yahoo!](https://github.com/jaredhanson/passport-yahoo) (OpenID)
- [Yahoo!](https://github.com/jaredhanson/passport-yahoo-oauth) (OAuth 1.0)
- [Yammer](https://github.com/jaredhanson/passport-yammer)
- [Yandex](https://github.com/gurugray/passport-yandex) by [Sergey Sergeev](https://github.com/gurugray)
- [OpenAM](https://github.com/alesium/passport-openam) by [Alesium](https://github.com/alesium)
- [HTTP](https://github.com/jaredhanson/passport-http) (HTTP Basic and Digest schemes)
- [HTTP-Bearer](https://github.com/jaredhanson/passport-http-bearer) (HTTP Bearer scheme)
- [Dummy](https://github.com/developmentseed/passport-dummy) by [Development Seed](https://github.com/developmentseed)

**Attention Developers:** If you implement a new authentication strategy for
Passport, send me a message and I will update the list.

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/passport.png)](http://travis-ci.org/jaredhanson/passport)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

(The MIT License)

Copyright (c) 2011 Jared Hanson

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
