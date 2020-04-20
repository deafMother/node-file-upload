const express = require('express');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const morgan = require('morgan');

const MyFile = require('./model/fileModel');

// create express app
const app = express();

app.use(morgan('dev'));

// console.log(__dirname);
// specify the storage location
// there is a probem if the filename contains spaces so we are removing it
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/tmp-multer');
  },
  filename: function (req, file, cb) {
    let filename =
      file.fieldname + '-' + Math.floor(Date.now() / 10000) + file.originalname;
    filename = filename.split(' ').join('');
    cb(null, filename);
  },
});

// optional filter
function fileFilter(req, file, cb) {
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted
  // we can create a directory dynamically depending on some filed on the request object if needed
  let dir = __dirname + '/tmp-multer';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  console.log(file);

  // To reject this file pass `false`, like so:
  //cb(null, false);

  // To accept the file pass `true`, like so:
  cb(null, true);

  // You can always pass an error if something goes wrong:
  //cb(new Error("I don't have a clue!"));
}
var upload = multer({
  storage: storage,
  limits: {
    files: 5, // allow up to 5 files per request,
    fieldSize: 2 * 1024 * 1024, // 2 MB (max file size)
  },
  fileFilter: fileFilter,
});

let name = 'File Uploader';
// base url
app.get('/', (req, res) => {
  res.send(`
    <h2>With <code>"express"</code> ${name}</h2>
    <h4> <a href="/allFiles">All files</a></h4>
    <form action="/uploadFile" enctype="multipart/form-data" method="post" style="padding:10px; border:1px solid teal; border-radius:4px">      
      <div>File: <input type="file" name="avatar" multiple="multiple" /></div>      
      <input type="submit" value="Upload"  style="margin:10px 0"/>
    </form>
  `);
});

app.post('/uploadFile', upload.single('avatar'), async function (
  req,
  res,
  next
) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  try {
    const avatar = req.file;

    // make sure file is available
    if (!avatar) {
      res.status(400).send(`
        <h4>Unable to load file: </h4>
        <p>No file selected :<a href=/>back</a></p>
        
      `);
    } else {
      // save path to database
      await MyFile.create({
        fileName: avatar.originalname,
        type: avatar.mimetype,
        path: avatar.path,
        exactFilename: avatar.filename,
      });

      // send response
      res.send(`<h4>File uploaded Successfully</h4>
        <p>:<a href=/>back</a></p>
        `);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// fetch all files
app.get('/allFiles', async function (req, res, next) {
  // we can set up a fiter to display depending on various criterias
  const files = await MyFile.find();

  res.send(`
      <h2>Files No:  ${files.length}</h2>
      
      <div>
          ${files.map((file) => {
            `${console.log(file.exactFilename)}`;
            return `<p> <a href=/getFile/${file.exactFilename}>${file.exactFilename}</a></p>`;
          })}
      </div>
  `);
});

// dowaload a file

app.get('/getFile/:filename', async function (req, res, next) {
  const optionsForSendFile = {
    root: __dirname + '/tmp-multer',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
    },
  };

  const optionsForDownload = {
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
    },
  };
  const fileName = req.params.filename;

  /* sending a file: this will send to the browser and but will not allow to download
  res.sendFile(fileName, optionsForSendFile, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Sent:', fileName, ' path', options.root);
    }
  });
  */

  // to allow download use res.download
  res.download(
    `tmp-multer\\${fileName}`,
    fileName,
    optionsForDownload,
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Sent:', fileName);
      }
    }
  );
});

mongoose
  .connect(
    'mongodb+srv://userOne:user123456@cluster0-abpll.mongodb.net/fieUpload?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    }
  )
  .then((con) => {
    console.log('Connected');
  });

// start the app
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App is listening on port ${port}.`));
