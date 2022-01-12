const mongoose = require('mongoose');
const { TYPE_CASE } = require('../utils/constants');

const caseSchema = new mongoose.Schema({
  circuit: {
    type: String,
    default: null,
    trim: true,
  },
  switchKey: {
    type: String,
    default: null,
    trim: true,
  },
  stab: {
    type: String,
    default: null,
    trim: true,
  },
  keycap: {
    type: String,
    default: null,
    trim: true,
  },
  other: {
    type: String,
    default: null,
    trim: true,
  },
  diagnostic: {
    type: String,
    trim: true,
    default: '',
  },
  type: {
    type: Number,
    default: TYPE_CASE.NEW,
  },
});

const CaseModel = mongoose.model('case', caseSchema);

module.exports = CaseModel;
