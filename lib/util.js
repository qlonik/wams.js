var _ = require('lodash');

var isServer = process.title !== 'browser';
var enableLodash = true;

exports.isServer = isServer;
exports.enableLodash = enableLodash;

exports.elemOrArray = elemOrArray;
exports.map = map;

// from nodejs's events.js - optimize case of one node
function elemOrArray(addTo, el) {
   var res;

   if (_.isUndefined(addTo)) {
      // don't need extra array object
      res = el;
   } else if (_.isArray(addTo)) {
      // if we have already got an array, just append
      res = addTo.slice(0).push(el);
   } else {
      // adding the second element, need to change to array
      res = [addTo, el];
   }

   return res;
}

/**
 * Run map function with lodash or without
 * @param {Array} array
 * @param {Function} cb
 * @returns {Array}
 */
function map(array, cb) {
   if (enableLodash) {
      return _.map(array, cb);
   } else {
      return array.map(cb);
   }
}