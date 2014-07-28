var resolve = require('path').resolve,

   browserify = require('browserify'),
   express = require('express'),
   log = require('debug')('wams:netPathRouter'),

   util = require('../util'),
   clientModule = require.resolve('../client'),
   clientDefaultJS = require.resolve('../client/default');

module.exports = function(server) {
   var router = express.Router();

   server.racer.store.on('bundle', function(b) {
      b.require(clientModule, {expose: 'wams'});
   });

   router.get('/', function(req, res, next) {
      res.end('Hello\nThis is wams.js page');
   });

   router.get('/client.js', function(req, res, next) {
      server.racer.store.bundle(clientDefaultJS, function(err, js) {
         if (err) { return next(err); }

         res.type('js');
         res.send(js);
      });
   });

   return router;
};