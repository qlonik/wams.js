WAMS = require('../../lib2');
util = WAMS.util;

mainWS = WAMS.Workspace(3000);
clientWSs = [];
bigPicture = WAMS.WorkspaceObject({
   tag: 'img',
   attr: {
      class: 'pic',
      src: 'http://placekitten.com/1000/500'
   }
});

function reorganize() {
   var i, ws, prevws, newX = 0, newY = 0, nextLine = 0,
      parentS = mainWS.shape;

   if (clientWSs.length) {
      ws = clientWSs[0];
      ws.mergeShape({ x: 0, y: 0 });
      nextLine = ws.shape.y + ws.shape.h;

      for (i = 1; i < clientWSs.length; i++) {
         ws = clientWSs[i];
         prevws = clientWSs[i - 1];

         newX = prevws.shape.x + prevws.shape.w;
         if (newX + ws.shape.w <= parentS.w) {
            ws.mergeShape({ x: newX, y: newY});
         } else {
            newY = nextLine;
            newX = 0;
            ws.mergeShape({ x: newX, y: newY });
         }
         if (ws.shape.y + ws.shape.h > nextLine) {
            nextLine = ws.shape.y + ws.shape.h;
         }
      }
   }
}

function addClientHandler(err, ws, client) {
   var clientWS = WAMS.Workspace();

   clientWS.mergeStyle({ background: 'blue' });
   clientWS.set('role', 'table');
   clientWS.set('index', clientWSs.length);

   clientWS.addElement(bigPicture);

   clientWS.addClient(client);
   clientWSs.push(clientWS);
}
function readyClientHandler(err, ws, client) {
   util.forEach(client.workspaces, function(ws) {
      ws.mergeShape({ w: client.shape.w, h: client.shape.h });
   });
   reorganize();
}
function removeClientHandler(err, ws, client) {
   var removed = util.remove(clientWSs, function(tableWS) {
      return tableWS.containsClient(client);
   });
   util.forEach(removed, function(tableWS) {
      tableWS.cleanModel();
   });
   reorganize();
}

mainWS.mergeShape({ w: 1500, h: 20000 });
mainWS.set('role', 'mainWS');
mainWS.on(util.WORKSPACE_EVENTS.clientConnected, addClientHandler);
mainWS.on(util.WORKSPACE_EVENTS.clientReady, readyClientHandler);
mainWS.on(util.WORKSPACE_EVENTS.clientDisconnected, removeClientHandler);