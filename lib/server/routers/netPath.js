var resolve = require('path').resolve,

   _ = require('lodash'),
   browserify = require('browserify'),
   express = require('express'),
   log = require('debug')('wams:netPathRouter'),

   clientModule = require.resolve('../../client'),
   clientDefaultJS = require.resolve('../../client/default');

module.exports = function(server) {
   var router = express.Router();

   /**
    *
    * @param {String} [js] Path to custom js file that will be executed on client
    * @param {Function} cb Function to execute when bundle is created
    */
   function createBundle(js, cb) {
      if (_.isUndefined(cb)) {
         cb = js;
         js = undefined;
      }

      var b = browserify();
      b.require(clientModule, {expose: 'wams'});
      server.emit('bundle', b);

      if (_.isUndefined(js)) {
         b.add(clientDefaultJS);
      } else {
         b.add(resolve(js));
      }

      b.bundle(function(err, src) {
         if (err) { return cb(err); }

   //      log('Bundle created');
         return cb(null, src);
      });
   }

   server.wams.racer.store.on('bundle', function(b) {
      b.require(clientModule, {expose: 'wams'});
   });

   router.get('/', function(req, res, next) {
      res.end('Hello\nThis is wams.js page');
   });

   router.get('/client.js', function(req, res, next) {
//   log('Bundle requested');

      // no racer
//   createBundle(function(err, js) {
//      if (err) { return next(err); }
//
//      res.type('js');
//      res.send(js);
//   });
      // racer
      server.wams.racer.store.bundle(clientDefaultJS, function(err, js) {
         if (err) { return next(err); }

         res.type('js');
         res.send(js);
      });
   });

   return router;
};