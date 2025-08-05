// require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const eventRoutes = require('./routes/eventRoutes');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const User = require('./models/user'); // Added for navbar dynamic user

// controllers / routes / middleware
const userRoutes = require('./routes/userRoutes');

// configure app
let port = 8084;
let host = 'localhost';
let url = 'mongodb+srv://ncain1:Boxes123@desmoscluster.aqumli1.mongodb.net/';

// create app
const app = express();

// connect to MongoDB
mongoose.connect(url)
  .then(() => {
    app.listen(port, host, () => {
      console.log('Server is running on port ', port);
    });
  })
  .catch(err => console.log(err.message));

app.set('view engine', 'ejs');

// core middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'change-this-in-env',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60
  },
  store: new MongoStore({ mongoUrl: url })
}));

// flash BEFORE routes, and expose to views
app.use(flash());
app.use((req, res, next) => {
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');

  if (req.session.user) {
    User.findById(req.session.user)
      .then(user => {
        res.locals.currentUser = user; // full user object for dynamic navbar
        next();
      })
      .catch(err => next(err));
  } else {
    res.locals.currentUser = null;
    next();
  }
});

// Mount routes
app.use('/users', userRoutes);
app.use('/events', eventRoutes);

// home
app.get('/', (req, res) => {
  res.render('index');
});

// 404 handler
app.use((req, res, next) => {
  let err = new Error('The server cannot locate ' + req.url);
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const isDev = req.app.get('env') === 'development';

  res.status(status);
  res.render('error', {
    error: {
      status: status,
      message: err.message || 'Internal Server Error',
      stack: isDev ? err.stack : null
    }
  });
});