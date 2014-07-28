var express = require('express'),
   log = require('debug')('wams:allRouter');

module.exports = function(server) {
   var router = express.Router();

   router.get('/', function(req, res, next) {
//   log('Requested main page');
      next();
   });

   return router;
};