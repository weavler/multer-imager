var S3FS = require('s3fs');
var crypto = require('crypto');
var colors=require('colors')
var gm = require('gm');

function S3Storage(opts) {
  if (!opts.bucket) {
    throw new Error('bucket is required');
  }
  if (!opts.secretAccessKey) {
    throw new Error('secretAccessKey is required');
  }
  if (!opts.accessKeyId) {
    throw new Error('accessKeyId is required');
  }
  if (!opts.region) {
    throw new Error('region is required');
  }
  if (!opts.dirname) {
    throw new Error('dirname is required');
  }
/*  if (!opts.gm) {
    throw new Error('gm is required');
  }*/
  this.options = opts;
  this.options.filename = (opts.filename || getFilename);
  this.s3fs = new S3FS(opts.bucket, opts);
}

function getFilename(req, file, cb) {
  crypto.pseudoRandomBytes(16, function(err, raw) {
    cb(err, err ? undefined : raw.toString('hex'));
  });
}

S3Storage.prototype._handleFile = function(req, file, cb) {
  var self = this;
  self.options.filename(req, file, function(err, filename) {
    if (err) {
      return cb(err);
    }
    console.log(file)
    var filePath = self.options.dirname + '/' + filename;
    var outStream = self.s3fs.createWriteStream(filePath,{"ContentType":file.mimetype});    
    outStream.on('error', cb);
    outStream.on('finish', function() {
      cb(null, {
        size: outStream.bytesWritten,
        key: filePath,
        location: (self.options.s3Domain||'https://' + self.options.bucket+'.s3.amazonaws.com' )+'/'+ filePath
      });
    });


    gm(file.stream,file.originalname).size(
      {bufferStream: true},
      function(err, size) { //donot use arrow function as it uses global context as `this`
        if(err) return cb(err)
        if (size && (size.width > self.options.maxDimension || size.height > self.options.maxDimension))
          this.resize(self.options.maxDimension,self.options.maxDimension)
        this
        .stream()
        .pipe(outStream);
    })
    

  });
};

S3Storage.prototype._removeFile = function(req, file, cb) {
  this.s3fs.unlink(file.key, cb);
};

module.exports = function(opts) {
  return new S3Storage(opts);
};
