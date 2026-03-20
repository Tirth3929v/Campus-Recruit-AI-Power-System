const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  // Link to the user account that manages this profile
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a company description']
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  logo: {
    type: String,
    default: 'https://via.placeholder.com/150' // Default placeholder if no logo uploaded
  },
  industry: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);