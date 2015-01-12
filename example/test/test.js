var WAMS = require('../../lib2'),
   util = WAMS.util;

var main = WAMS.Workspace();
var wsObject = WAMS.WorkspaceObject({
   tag: 'img',
   attr: {
      src: 'http://placekitten.com/300/300'
   },
   style: {
      position: 'absolute'
   }
});

main.mergeStyle({
   background: 'blue'
});
main.addElement(wsObject);

main.on(util.WORKSPACE_EVENTS.clientConnected, function(err, ws, client) {
   main.addClient(client);
});
