var liveDbMongo = require('livedb-mongo'),
   redis = require('redis').createClient(),
   racer = require('racer'),

   util = require('./util'),
   Server = require('./Server'),
   WorkspaceObject = require('./WorkspaceObject'),
   Workspace = require('./Workspace'),
   Client = require('./Client');

var atLeastOneServer = false,
   store = racer.createStore({
      db: liveDbMongo('localhost:27017/wams?auto_reconnect', { safe: true }),
      redis: redis
   }),
   model = store.createModel(),
   path = util.RACER_PATH,
   racerObj = {
      store: store,
      model: model,
      path: path
   };

function WAMS(port) {
   var srv,
      wrkspc = new Workspace(racerObj);

   if (port || !atLeastOneServer) {
      srv = new Server(racerObj, port ? { port: port } : {});
      atLeastOneServer = true;
   }

   if (srv) {
      wrkspc.attachServer(srv);
   }

   return wrkspc;
}

WAMS._Server = Server;
WAMS._Workspace = Workspace;
WAMS._WorkspaceObject = WorkspaceObject;
WAMS._Client = Client;

WAMS.Workspace = WAMS;
WAMS.WorkspaceObject = function() {
   return new WorkspaceObject();
};
WAMS.Client = function() {
   return new Client();
};

module.exports = WAMS;