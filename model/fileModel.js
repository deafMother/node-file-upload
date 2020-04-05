const mongoose = require('mongoose');

let fileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: [true, 'File name must be provided'],
  },
  type: {
    type: String,
    required: [true, 'File extension is required'],
  },
  path: {
    type: String,
    required: [true, 'File path is required'],
  },
  exactFilename: {
    type: String,
    required: [true, 'File path is required'],
  },
});

const fileModel = mongoose.model('MyFile', fileSchema);

module.exports = fileModel;
