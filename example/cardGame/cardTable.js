var WAMS = require('../../');
//var cardgame = require('./cardgame');

var MAX_HANDS = 4;

var mainWS = WAMS(3000);
mainWS.setPixelDimension(1000000);

var tableWS = WAMS();
mainWS.addElement(tableWS);

var handWS = [],
   handCount = 0,
   tableConnected = false;

var addClientHandler = function(ws, client) {
   if (!tableConnected) {
      tableWS.addClient(client);

      tableWS.setPixelDimension(client.shape.w, client.shape.h);
      tableWS.appendStyle({ background: 'darkGreen' });

//      tableWS.on('drag', tableDrag);

//      console.log(tableWS.racer.model.get());
      tableConnected = true;

//      tableWS.objectMovment(WAMS.CONTINUOUS);
//      tableWS.setObjectsInBounds(true);
   } else if (handCount < MAX_HANDS) {
      var x, y, card, cardX, cardY,
         hand = WAMS();

      hand.addClient(client);
//      hand.rotateRelativeParent(handCound * 90);

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

//      hand.objectMovement(WAMS.CONTINUOUS);
//      hand.setObjectsInBounds(true);

//      card = WAMS.Object(new Card);
//      cardX = (hand.shape.w - card.shape.w) / 2;
//      cardY = (hand.shape.h - card.shape.h) / 2;
//      card.setPosition(cardX, cardY);
//      hand.addElement(card);

      tableWS.addElement(hand);
      handWS[handCount] = hand;
      handCount++;
   } else {
//      client.sendError('There are already ' + MAX_HANDS + ' clients connected to ' +
//         'this game. You have been disconnected.');
//      client.disconnect();
   }
};
var removeClientHandler = function(ws, client) {
};
var handleDrag = function(ws, client, data) {

};

mainWS.on('connection', addClientHandler);
mainWS.on('disconnect', removeClientHandler);
mainWS.on('drag', handleDrag);
