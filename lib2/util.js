var _ = require('lodash');

var enableLodash = true;

function notImplemented(func) {
   throw new Error('Function "' + func + '" not implemented');
}
function forOwn(collection, cb) {
   var index, item,
      ownIndex = -1, ownProps = Object.keys(collection),
      length = ownProps ? ownProps.length : 0;

   while (++ownIndex < length) {
      index = ownProps[ownIndex];
      item = collection[index];
      cb(item, index, collection);
   }
}
forOwn(_, function (item, index, collection) {
   if (typeof item === 'function' && item !== collection) {

      exports[index] = function () {
         var args = Array.prototype.slice.call(arguments, 0);
         if (enableLodash) {
            return item.apply(_, args);
         } else {
            notImplemented(index);
         }
      }

   }
});

