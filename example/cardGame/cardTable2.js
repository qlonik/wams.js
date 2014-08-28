WAMS = require('../../lib2');
var util = WAMS.util;
//var cardgame = require('./cardgame');

var MAX_HANDS = 4;

mainWS = WAMS(3000);
tableWS = WAMS();
handWS = [];
var handCount = 0,
   tableConnected = false;

var addClientHandler = function(err, ws, client) {
   if (!tableConnected) {
      client.set('role', 'table');
      tableWS.addClient(client);

      tableConnected = true;

//      tableWS.objectMovement(WAMS.CONTINUOUS);
//      tableWS.setObjectsInBounds(true);
   } else if (handCount < MAX_HANDS) {
      var x, y, card, cardX, cardY,
         hand = WAMS();

      client.set('role', 'hand');
      client.set('index', handCount);
      hand.addClient(client);

      hand.mergeStyle({ background: 'blue' });

//         hand.objectMovement(WAMS.CONTINUOUS);
//         hand.setObjectsInBounds(true);
//
//         card = WAMS.Object(new Card);
//         cardX = (hand.shape.w - card.shape.w) / 2;
//         cardY = (hand.shape.h - card.shape.h) / 2;
//         card.setPosition(cardX, cardY);
//         hand.addElement(card);

      card = WAMS.WorkspaceObject({
         tag: 'img',
         attr: {
            class: ['card', 'mt'],
            src: 'http://dc181.4shared.com/img/z5oj2oMO/s7/12a0f97e110/Playing_Card_Club.png'
         },
         style: {
            width: '150px',
            height: 'auto'
         }
      });
//      card.mergeShape({ x: 0, y: 0 });
      hand.addElement(card);
      ball = WAMS.WorkspaceObject({
         tag: 'div',
         attr: {
            class: 'ball'
         },
         style: {
            
         }
      });


//         tableWS.addElement(hand);
         handWS[handCount] = hand;
         handCount++;
   } else {
//      client.sendError('There are already ' + MAX_HANDS + ' clients connected to ' +
//         'this game. You have been disconnected.');
//      client.disconnect();
   }
};
var addClientHandler2 = function(err, ws, client) {
   client.set('role', 'table');
   client.set('index', handCount);
   handCount++;

   tableWS.addClient(client);
};
var readyClientHandler = function(err, ws, client) {
   var role = client.get('role'), index;
   if (role === 'hand') {
      index = client.get('index');
   }

   util.forEach(client.workspaces, function(wrkspc) {
      if (role === 'table') {
         wrkspc.mergeShape({ w: client.shape.w, h: client.shape.h });
      } else if (role === 'hand') {
         var x, y;
         if (index === 0) {
            // bottom
            x = (tableWS.shape.w - wrkspc.shape.w) / 2;
            y = tableWS.shape.h;
         } else if (index === 1) {
            //left
            x = -wrkspc.shape.w;
            y = (tableWS.shape.h - wrkspc.shape.h) / 2;
         } else if (index === 2) {
            //top
            x = -wrkspc.shape.h;
            y = (tableWS.shape.w - wrkspc.shape.w) / 2;
         } else if (index === 3) {
            //right
            x = tableWS.shape.w;
            y = (tableWS.shape.h - wrkspc.shape.h) / 2;
         }

         wrkspc.mergeShape({
            x: x,
            y: y,
            w: client.shape.w,
            h: client.shape.h,
            r: index * 90
         });
      }
   });
};
var removeClientHandler = function(err, ws, client) {
   // maybe some clean up
//   client.disconnect();
   if (handCount > 0) {
      var index = handCount--;
   } else {
      tableConnected = false;
   }
};
var removeClientHandler2 = function(err, ws, client) {
   tableWS.removeClient(client);
};
var handlePan = function(err, target, data, ws, client) {
   if (target.type === util.WORKSPACE_OBJECT_TYPE) {
      var wssM = mainWS.model.at(util.RACER_PATH + '.' + util.WORKSPACE_TYPE),
         wss = wssM.get();

      function checkAndAttach(ws) {
         var found = util.find(ws.inner, function(val) {
            return val.equal(target);
         });
         if (!found) {
            //TODO
//            if ()
//            ws.addElement(target);
         }
      }

      util.forEach(handWS, checkAndAttach);
      checkAndAttach(tableWS);
   } else {
      console.log('arguments');
   }
};
var handlePanEnd = function(err, target, data, ws, client) {
   var tS = target.shape, wsS = ws.shape;

   if (
      (tS.x > wsS.x + wsS.w) || //left border of target is behind right border of ws
      (tS.y > wsS.y + wsS.h) || //top border of target is lower bottom border of ws
      (tS.x + tS.w < wsS.x) ||  //right border of target is behind left border of ws
      (tS.y + tS.h < wsS.y)     //bottom border of target is above top border of ws
      ) {
      console.log('target ' + target.id + ' left ws ' + ws.id);
      ws.removeElement(target);
   }
};

mainWS.addElement(tableWS);

mainWS.mergeShape({ w: 1000000, h: 1000000 });
mainWS.set('role', 'mainWS');

tableWS.set('role', 'table');
tableWS.mergeStyle({ background: 'darkGreen' });
tableWS.on('pan', handlePan);

var tableElement = WAMS.WorkspaceObject({
   tag: 'img',
   attr: {
      class: ['card', 'mt'],
      src: 'http://dc181.4shared.com/img/z5oj2oMO/s7/12a0f97e110/Playing_Card_Club.png'
   }
});
tableElement.mergeShape({ w: 150, h: 200 });
tableWS.addElement(tableElement);

tableElement.on('pan', handlePan);
tableElement.on('panend', handlePanEnd);

var mainModel = tableWS.model,
   mainPath = util.RACER_PATH;

//mainWS.on(WAMS.util.WORKSPACE_EVENTS.clientConnected, addClientHandler);
mainWS.on(WAMS.util.WORKSPACE_EVENTS.clientConnected, addClientHandler2);
mainWS.on(WAMS.util.WORKSPACE_EVENTS.clientReady, readyClientHandler);
mainWS.on(WAMS.util.WORKSPACE_EVENTS.clientDisconnected, removeClientHandler2);
