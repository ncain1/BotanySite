const { escapeXML } = require('ejs');
const model = require('../models/event');

// Display all events sorted/grouped by category
exports.index = (req, res, next) => {
  model.find()
    .populate('host', 'firstName lastName')
    .then(events => {
      const categories = {};
      events.forEach(event => {
        if (!categories[event.category]) {
          categories[event.category] = [];
        }
        categories[event.category].push(event);
      });

      res.render('event/index', { categories });
    })
    .catch(err => next(err));
};

// Render new event form
exports.new = (req, res) => {
  res.render('./event/new');
};

// Create a new event
exports.create = (req, res, next) => {
  try {
    if (!req.session.user) {
      req.flash('error', 'You must be logged in to create an event');
      return res.redirect('/login');
    }

    const { title, category, details, startDateTime, endDateTime, location, image } = req.body;

    const event = new model({
      title,
      category,
      details,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      location,
      host: req.session.user,
      image
    });

    event.save()
      .then(() => {
        req.flash('success', 'Event created successfully');
        res.redirect('/events');
      })
      .catch(err => {
        if (err.name === 'ValidationError') err.status = 400;
        next(err);
      });
  } catch (err) {
    next(err);
  }
};

// Show event details
exports.show = (req, res, next) => {
  const id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const err = new Error('Invalid event id');
    err.status = 400;
    return next(err);
  }

  model.findById(id)
    .populate('host', 'firstName lastName') // ensure host name is available
    .then(event => {
      if (event) {
        return res.render('./event/show', { 
          event, 
          user: req.session.user // so show.ejs can compare
        });
      } else {
        const err = new Error('Cannot find an event with id ' + id);
        err.status = 404;
        next(err);
      }
    })
    .catch(err => next(err));
};

// Render edit form
exports.edit = (req, res, next) => {
  const id = req.params.id;

  model.findById(id)
    .then(event => {
      if (event) {
        return res.render('./event/edit', { event });
      } else {
        const err = new Error('Event not found');
        err.status = 404;
        next(err);
      }
    })
    .catch(err => next(err));
};

// Update an event
exports.update = (req, res, next) => {
  const id = req.params.id;

  model.findByIdAndUpdate(id, req.body, { runValidators: true, new: true })
    .then(event => {
      if (event) {
        req.flash('success', 'Event updated successfully');
        res.redirect('/events/' + id);
      } else {
        const err = new Error('Event not found');
        err.status = 404;
        next(err);
      }
    })
    .catch(err => {
      if (err.name === 'ValidationError') { 
        err.status = 400;
      }
      next(err);
    });
};

// Delete an event
exports.delete = (req, res, next) => {
  const id = req.params.id;
  model.findByIdAndDelete(id)
    .then(event => {
      if (event) {
        req.flash('success', 'Event deleted successfully');
        res.redirect('/events');
      } else {
        const err = new Error('Event not found');
        err.status = 404;
        next(err);
      }
    })
    .catch(err => next(err));
};