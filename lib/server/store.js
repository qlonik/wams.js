var _ = require('lodash');

function Store() {
   Array.call(this);
}

_.merge(Store.prototype, Array.prototype);

module.exports = exports = Store;