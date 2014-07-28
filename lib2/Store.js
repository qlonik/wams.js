var util = require('./util');

function Store() {
   Array.call(this);
}

util.merge(Store.prototype, Array.prototype);

module.exports = exports = Store;