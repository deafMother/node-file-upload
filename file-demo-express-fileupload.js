// uploading a file using express-fileupload

/*
express - Popular web framework built on top of Node.js. We'll be using it for developing REST API.
body-parser - Node.js request body parsing middleware which parses the incoming request body before your handlers, and makes it available under req.body property. In short, it simplifies the incoming request.
cors - Another Express middleware for enabling CORS (Cross-Origin Resource Sharing) requests.
express-fileupload - Simple Express middleware for uploading files. It parses multipart/form-data requests, extracts the files if available, and make them available under req.files property.
morgan - Node.js middleware for logging HTTP requests.
lodash - A JavaScript library that provides utility functions for arrays, numbers, objects, strings, etc.

*/

// how express-fileupload middleware works
/*
    ow express-fileupload middleware works?
It makes the uploaded files accessible from req.files property. For example, if you are uploading a file called my-profile.jpg, and your field name is avatar, you can access it via req.files.avatar. The avatar object will contain the following information:

avatar.name - The name of the uploaded file i.e. my-profile.jpg
avatar.mv - The function to move the file elsewhere on the server
avatar.mimetype - The mime-type of the file
avatar.size - The size of the file in bytes
avatar.data - A buffer representation of the uploaded file
Upload Multiple Files

*/

const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const _ = require("lodash");

const app = express();

// enable files upload
app.use(
  fileUpload({
    createParentPath: true
  })
);

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

//start app
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App is listening on port ${port}.`));

app.get("/", (req, res) => {
  res.send(`
    <h2>With <code>"express"</code> npm package</h2>
    <form action="/uploadFile" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
});

// allow to upload a single file
app.post("/uploadFile", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded"
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let avatar = req.files.someExpressFiles;
      console.log(avatar);

      const timeStamp = new Date().getTime();
      //   console.log(req.files);
      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      avatar.mv("./uploads/" + timeStamp + avatar.name);

      //send response
      res.send({
        status: true,
        message: "File is uploaded",
        data: {
          name: avatar.name,
          mimetype: avatar.mimetype,
          size: avatar.size
        }
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
