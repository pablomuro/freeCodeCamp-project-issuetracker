
const mongoose = require("mongoose")

const {
  Schema
} = mongoose;

const IssueSchema = new Schema({
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },

  created_by: {
    type: String,
    required: true
  },
  assigned_to: {
    type: String,
    required: false
  },
  status_text: {
    type: String,
    required: false
  },
  open: {
    type: Boolean,
    default: true
  }
}, {
  versionKey: false,
  timestamps: { createdAt: 'created_on', updatedAt: 'updated_on' },
  collection: "issues",
});

module.exports = mongoose.model('Issue', IssueSchema)
