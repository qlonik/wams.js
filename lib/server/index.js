var Workspace = require('./Workspace'),
   WorkspaceObject = require('./WorkspaceObject');

function WAMS(port) {
   return new Workspace(port);
}

WAMS.Workspace = WAMS;
WAMS.WorkspaceObject = function() {
   return new WorkspaceObject();
};

module.exports = exports = WAMS;