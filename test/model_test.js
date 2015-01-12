liveDbMongo = require('livedb-mongo');
redis = require('redis');
racer = require('racer');
store = racer.createStore({
   db: liveDbMongo('localhost:27017/test?auto_reconnect', { safe: true }),
   redis: redis.createClient()
});
model = store.createModel();
util = require('util');

model.subscribe('wams', function() {
   model.on('all', 'wams.test.**', function() {
      console.log('with dot');
      console.log(arguments);
   });
   model.on('all', 'wams.test**', function() {
      console.log('no dot');
      console.log(arguments);
   });

});

console.log(model);
console.log(model.get());
