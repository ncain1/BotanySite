const User = require('../models/user');
const Event = require('../models/event');

// GET /users/new
exports.new = (req, res) => {
  return res.render('user/new'); 
};

// POST /users
exports.create = (req, res, next) => {
  const user = new User(req.body);
  user.save()
    .then(() => {
      req.flash('success', 'Account created successfully. Please log in.');
      res.redirect('/users/login');
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        req.flash('error', err.message);
        return res.redirect('/users/new');
      }
      if (err.code === 11000) {
        req.flash('error', 'Email has been used');
        return res.redirect('/users/new');
      }
      next(err);
    });
};

// GET /users/login
exports.getUserLogin = (req, res) => {
  return res.render('user/login');
};

// POST /users/login
exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        req.flash('error', 'wrong email address');
        return res.redirect('/users/login');
      }

      return user.comparePassword(password).then(ok => {
        if (!ok) {
          req.flash('error', 'wrong password');
          return res.redirect('/users/login');
        }

        req.session.user = user._id;
        req.flash('success', 'You have successfully logged in');
        return res.redirect('/users/profile');
      });
    })
    .catch(err => next(err));
};

// GET /users/profile
exports.profile = (req, res, next) => {
  const id = req.session.user;

  Promise.all([
    User.findById(id).lean(), // ensure _id and fields are plain JS object
    Event.find({ host: id }).lean()
  ])
    .then(([user, events]) => {
      res.render('user/profile', { user, events });
    })
    .catch(err => next(err));
};

// GET /users/logout -> destroy session
exports.logout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.redirect('/');
  });
};