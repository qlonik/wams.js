var WAMS = require('./server');
module.exports = WAMS;

/*
var Server = require('./server/Server');
//   Workspace = require('./server/Workspace'),
//   WorkspaceObject = require('./server/WorkspaceObject'),
//   Client = require('./server/Client');

var atLeastOneServer = false;

function WAMS(port) {
   var _this = this;
   if (port || !atLeastOneServer) {
      _this.srv = new Server(null, port ? { port: port } : {});
      atLeastOneServer = true;
   }
}

module.exports = exports = WAMS;
*/