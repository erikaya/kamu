var express = require('express');
var connect = require('connect');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var session = require('express-session');
var auth = require('./auth/passport');

var app = express();

app.use(logger('dev'));
app.use(connect.compress());
app.use(session({
  secret: "won't tell because it's secret",
  resave: true,
  saveUninitialized: true
}));
app.use(auth.initialize());
app.use(auth.session());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(path.join(__dirname, 'dist', 'favicon.ico')));

app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'dist'));
app.set('view engine', 'html');

app.post('/login/callback', auth.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function (req, res) {
    res.redirect('/');
  }
);

app.get('/login', auth.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function (req, res) {
    res.redirect('/');
  }
);

app.get('/', auth.protected, function (req, res, next)  {
  var username = req.user.firstName.concat(' ').concat(req.user.lastName);
  return res.render('index', { name: username, email: req.user.nameID });
});

app.use(express.static(path.join(__dirname, 'dist')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;