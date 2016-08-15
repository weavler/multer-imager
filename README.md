
This Imager multer storage engine permit to resize and upload an image to AWS S3.

This project is mostly an integration piece for existing code samples from Multer's [storage engine documentation](https://github.com/expressjs/multer/blob/master/StorageEngine.md).
And was inspired from [multer-imager](https://github.com/Alexandre-io/multer-imager), replacing [graphicsmagick-stream](https://github.com/e-conomic/graphicsmagick-stream) with [gm](https://github.com/aheckmann/gm)

# Requirements
## Debian/Ubuntu
```
apt-get install build-essential libgraphicsmagick++1-dev libarchive-dev
```

# Install
>Not available in npm registry

```
npm install git+https://github.com/acashjos/multer-imager.git --save
```

# Tests
Tested with [s3rver](https://github.com/jamhall/s3rver) instead of your actual s3 credentials.  Doesn't require a real account or changing of hosts files.  Includes integration tests ensuring that it should work with express + multer.

```
npm test
```


# Usage
```
var express = require('express');
var app = express();
var multer = require('multer');
var imager = require('multer-imager');

var upload = multer({
  storage: imager({
    dirname: 'avatars',
    bucket: 'bucket-name',
    accessKeyId: 'aws-key-id',
    secretAccessKey: 'aws-key',
    region: 'us-east-1',
    filename: function (req, file, cb) { // [Optional]: define filename (default: random)
      cb(null, Date.now())               // i.e. with a timestamp
    },                                   //
    maxDimension: 1200      // scale input to contain within a square of this dimension
  })
});

// Cf.: https://github.com/expressjs/multer/blob/master/README.md
app.post('/upload', upload.array('file', 1), function(req, res, next){ 
  console.log(req.files); // Print upload details
  res.send('Successfully uploaded!');
});
```
