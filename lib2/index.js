var readline = require('readline'),

   liveDbMongo = require('livedb-mongo'),
   redis = require('redis'),
   racer = require('racer'),

   util = require('./util'),
   Server = require('./Server'),
   WorkspaceObject = require('./WorkspaceObject'),
   Workspace = require('./Workspace'),
   Client = require('./Client');

var atLeastOneServer = false,
   store = racer.createStore({
      db: liveDbMongo('localhost:27017/wams?auto_reconnect', { safe: true }),
      redis: redis.createClient()
   }),
   model = store.createModel(),
   path = util.RACER_PATH;

function cleanModel() {
   model.del(path + '.clients');
   model.del(path + '.workspaces');
   model.del(path + '.workspaceObjects');
}

// graceful shutdown on windows
if (process.platform === 'win32') {
   var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
   });

   rl.on('SIGINT', function() {
      process.emit('SIGINT');
   });
}

//clean model on exit
process.on('SIGINT', function() {
   cleanModel();

   model.unfetch(path, function() {
      process.exit();
   });
});

function WAMS(port) {
   var srv;

   if (port || !atLeastOneServer) {
      srv = new Server(store, port ? { port: port } : {});
      atLeastOneServer = true;
   }

   return new Workspace(store, srv);
}

WAMS.util = util;

WAMS._Server = Server;
WAMS._Workspace = Workspace;
WAMS._WorkspaceObject = WorkspaceObject;
WAMS._Client = Client;

WAMS.Workspace = WAMS;
WAMS.WorkspaceObject = function(html) {
   return new WorkspaceObject(store, html);
};
WAMS.Client = function(socket) {
   return new Client(store, socket);
};

module.exports = WAMS;