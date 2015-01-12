var Workspace = require('./Workspace'),
   WorkspaceObject = require('./WorkspaceObject'),
   Client = require('./Client');

function WAMS(port) {
   return new Workspace(port);
}

WAMS._WorkspaceInstance = Workspace;
WAMS._WorkspaceObjectInstance = WorkspaceObject;
WAMS._ClientInstance = Client;

WAMS.WORKSPACE_EVENTS = Workspace.WORKSPACE_EVENTS;
WAMS.WORKSPACE_OBJECT_EVENTS = WorkspaceObject.WORKSPACE_OBJECT_EVENTS;
WAMS.CLIENT_EVENTS = Client.CLIENT_EVENTS;

WAMS.Workspace = WAMS;
WAMS.WorkspaceObject = function() {
   return new WorkspaceObject();
};

module.exports = exports = WAMS;