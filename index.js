"use strict"

var Worker = require("basic-distributed-computation").Worker;
var toArray = require('stream-to-array')

class PipeToBuffer extends Worker {
  constructor(parent){
    super("pipe-to-buffer", parent);
  }

  work(req, inputKey, outputKey){
    var inVal = req.body;
    if(inputKey){
      inVal = req.body[inputKey];
    }

    toArray(inVal)
      .then(function (parts) {
        var buffers = []
        for (var i = 0, l = parts.length; i < l ; ++i) {
          var part = parts[i]
          buffers.push((part instanceof Buffer) ? part : new Buffer(part))
        }
        return Buffer.concat(buffers)
      }).then((buffer) => {
        if(outputKey){
          req.body[outputKey] = buffer;
        } else {
          req.body = buffer;
        }
      }).catch((err) => {
        req.status(err);
      }).finally(() => {
        req.next();
      })
  }
}

module.exports = PipeToBuffer;
