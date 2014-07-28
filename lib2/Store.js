var util = require('./util');

function Store() {
}

Store.prototype = Array.prototype;


Store.prototype.find = function(property) {
   return util.find(this, function(el) {
      return el.equal(property);
   });
};

Store.prototype.remove = function(property) {
   return util.remove(this, function(el) {
      return el.equal(property);
   });
};

module.exports = exports = Store;