const Event = require('../models/event');

exports.isGuest = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  req.flash('error', 'You are logged in already');
  return res.redirect('/users/profile');
};

exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'You must be logged in first');
    return res.redirect('/users/login');
  }
  next();
};

exports.isHost = (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.session.user;

  Event.findById(eventId)
    .populate('host')
    .then(event => {
      if (!event) {
        req.flash('error', 'Event not found');
        return res.redirect('/events');
      }

      // check if logged-in user is the host
      if (event.host && event.host._id.toString() === userId.toString()) {
        return next();
      }

      // Not the host — block access
      req.flash('error', 'You are not authorized to perform this action');
      return res.redirect('/events/' + eventId);
    })
    .catch(err => next(err));
};