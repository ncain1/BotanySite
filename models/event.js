const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({ 
  title: {
    type: String,
    required: [true, 'title is required']
  },
  category: {
    type: String,
    enum: {
      values: ['Botany', 'Gardening', 'Hydroponics', 'Permaculture', 'Composting'],
      message: 'Category must be one of: Botany, Gardening, Hydroponics, Permaculture, Composting'
    },
    required: [true, 'category is required']
  },
  details: {
    type: String,
    required: [true, 'details are required'],
    minLength: [10, 'details should have at least 10 characters']
  },
  startDateTime: {
    type: Date,
    required: [true, 'Start date/time is required']
  },
  endDateTime: {
    type: Date,
    required: [true, 'End date/time is required']
  },
  location: {
    type: String,
    required: [true, 'location is required']
  },
  host: {
    type: Schema.Types.ObjectId, ref:'User'
  },
  image: {
    type: String,
    required: [true, 'image URL is required']
  }
}, { timestamps: true });
//collectuon name is stories in the database
module.exports = mongoose.model('Event', eventSchema);
