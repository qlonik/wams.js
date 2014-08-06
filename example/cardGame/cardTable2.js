var WAMS = require('../../');
//var cardgame = require('./cardgame');

var MAX_HANDS = 4;

var mainWS = new WAMS._WorkspaceInstance(3000);
mainWS.setPixelDimension(1000000);

var tableWS = new WAMS._WorkspaceInstance();
mainWS.addElement(tableWS);

var handWS = [],
   handCount = 0,
   tableConnected = false;

var addClientHandler = function(err, ws, client) {
   console.log(ws);
   console.log(client);
   if (!tableConnected) {
      tableWS.addClient(client);

      client.on(WAMS.CLIENT_EVENTS.shapeChanged, function(err, shape) {
         tableWS.setPixelDimension(shape.w, shape.h);
      });
      tableWS.appendStyle({ background: 'darkGreen' });

      tableWS.on('drag', handleDrag);

//      console.log(tableWS.racer.model.get());
//      tableConnected = true;

//      tableWS.objectMovment(WAMS.CONTINUOUS);
//      tableWS.setObjectsInBounds(true);
   } else if (handCount < MAX_HANDS) {
      var x, y, card, cardX, cardY,
         hand = new WAMS._WorkspaceInstance();

      hand.addClient(client);
      client.on(WAMS.CLIENT_EVENTS.shapeChanged, function (err, shape) {
         hand.setPixelDimension(shape.w, shape.h);

         if (handCount === 0) {
            // bottom
            x = (tableWS.shape.w - hand.shape.w) / 2;
            y = tableWS.shape.h;
         } else if (handCount === 1) {
            //left
            x = -hand.shape.w;
            y = (tableWS.shape.h - hand.shape.h) / 2;
         } else if (handCount === 2) {
            //top
            x = -hand.shape.h;
            y = (tableWS.shape.w - hand.shape.w) / 2;
         } else if (handCount === 3) {
            //right
            x = tableWS.shape.w;
            y = (tableWS.shape.h - hand.shape.h) / 2;
         }
         hand.setLocation(x, y);
//         hand.rotateRelativeParent(handCound * 90);
//
//         hand.objectMovement(WAMS.CONTINUOUS);
//         hand.setObjectsInBounds(true);
//
//         card = WAMS.Object(new Card);
//         cardX = (hand.shape.w - card.shape.w) / 2;
//         cardY = (hand.shape.h - card.shape.h) / 2;
//         card.setPosition(cardX, cardY);
//         hand.addElement(card);

            tableWS.addElement(hand);
            handWS[handCount] = hand;
            handCount++;
      });
   } else {
//      client.sendError('There are already ' + MAX_HANDS + ' clients connected to ' +
//         'this game. You have been disconnected.');
//      client.disconnect();
   }
};
var removeClientHandler = function(err, ws, client) {
   // maybe some clean up
//   client.disconnect();
};
var handleDrag = function(err, ws, client, data) {
   console.log(arguments);
};

mainWS.on(WAMS.WORKSPACE_EVENTS.clientConnected, addClientHandler);
mainWS.on(WAMS.WORKSPACE_EVENTS.clientDisconnected, removeClientHandler);
mainWS.on('drag', handleDrag);
