WAMS = require('../../lib2');
util = WAMS.util;

var MAX_HANDS = 4;

mainWS = WAMS.Workspace(8948);
tableWS = WAMS.Workspace();
tableElement = WAMS.WorkspaceObject({
   tag: 'img',
   attr: {
      class: ['card', 'mt'],
      src: 'http://dc181.4shared.com/img/z5oj2oMO/s7/12a0f97e110/Playing_Card_Club.png'
   }
});
handWS = {
   b: undefined,
   l: undefined,
   t: undefined,
   r: undefined,
   length: function () {
      var len = 0;

      if (this.b) {
         len++;
      }
      if (this.l) {
         len++;
      }
      if (this.t) {
         len++;
      }
      if (this.r) {
         len++;
      }

      return len;
   },
   getNext: function () {
      if (!this.b) {
         return 'b';
      } else if (!this.l) {
         return 'l';
      } else if (!this.t) {
         return 't'
      } else if (!this.r) {
         return 'r'
      } else {
         return ''
      }
   },
   deleteWS: function (pos) {
      if (this[pos]) {
         this[pos] = undefined;
      }
   }
};
tableConnected = false;

function addClientHandler(err, ws, client) {
   if (!tableConnected) {
      client.set('role', 'table');

      tableWS.addClient(client);
      tableConnected = true;
   } else if (handWS.length() < MAX_HANDS) {
      var hand = WAMS.Workspace(),
         pos = handWS.getNext();

      hand.mergeStyle({ background: 'blue' });
      hand.set('role', 'handWS');
      hand.set('pos', pos);

      client.set('role', 'hand');
      client.set('pos', pos);

      handWS[pos] = hand;
      mainWS.addElement(hand);
      hand.addClient(client);
   } else {
//      mainWS.addClient(client);
   }
}
function readyClientHandler(err, ws, client) {
   util.forEach(client.workspaces, function(wrkspc) {
      var role = wrkspc.get('role'),
         pos = wrkspc.get('pos');

      if (role === 'tableWS') {
         wrkspc.mergeShape({ w: client.shape.w, h: client.shape.h });
      } else if (role === 'handWS') {
         var x, y, r;
         if (pos === 'b') {
            x = (tableWS.shape.w - client.shape.w) / 2;
            y = tableWS.shape.h;
            r = 0;
         } else if (pos === 'l') {
            x = -client.shape.w;
            y = (tableWS.shape.h - client.shape.h) / 2;
            r = 90;
         } else if (pos === 't') {
            x = (tableWS.shape.w - client.shape.w) / 2;
            y = -client.shape.h;
            r = 180;
         } else if (pos === 'r') {
            x = tableWS.shape.w;
            y = (tableWS.shape.h - client.shape.h) / 2;
            r = 270;
         }

         wrkspc.mergeShape({
            x: x,
            y: y,
            w: client.shape.w,
            h: client.shape.h,
            r: r
         });
      }
   });
}
function removeClientHandler(err, ws, client) {
   var role = client.get('role');

   ws.removeClient(client);
   if (role === 'table') {
      tableConnected = false;
   } else if (role === 'hand') {
      handWS.deleteWS(client.get('pos'));
   }
}
function handlePan(err, target, data, ws, client) {
   if (target.type === util.WORKSPACE_OBJECT_TYPE) {
      function checkWS(ws) {
         var found = util.find(ws.inner, function(val) {
            return val.equal(target);
         }), tS = target.shape, wsS = ws.shape;

         if (!found) {
            if (
               (tS.x <= ws.shape.x + wsS.w) && // left of obj is inside of ws
               (tS.y <= ws.shape.y + wsS.h) && //top of obj is inside of ws
               (tS.x + tS.w >= wsS.x) &&       //right of obj is inside ws
               (tS.y + tS.h >= wsS.y)          //bot of obj is inside of ws
               ) {
               console.log('target ' + target.id + ' entered ws ' + ws.id);
               ws.addElement(target);
            }
            /*
         } else {
            if (
               (tS.x > wsS.x + wsS.w) || //left border of target is behind right border of ws
               (tS.y > wsS.y + wsS.h) || //top border of target is lower bottom border of ws
               (tS.x + tS.w < wsS.x) ||  //right border of target is behind left border of ws
               (tS.y + tS.h < wsS.y)     //bottom border of target is above top border of ws
               ) {
               console.log('target ' + target.id + ' left ws ' + ws.id);
               ws.removeElement(target);
            }
            /**/
         }
      }

      checkWS(tableWS);
      if (handWS.b) { checkWS(handWS.b); }
      if (handWS.l) { checkWS(handWS.l); }
      if (handWS.t) { checkWS(handWS.t); }
      if (handWS.r) { checkWS(handWS.r); }
   } else {
      console.log('handlePan()');
      console.log(arguments);
   }
}

mainWS.mergeShape({ w: 1000000, h: 1000000 });
mainWS.set('role', 'mainWS');
mainWS.on(util.WORKSPACE_EVENTS.clientConnected, addClientHandler);
mainWS.on(util.WORKSPACE_EVENTS.clientReady, readyClientHandler);
mainWS.on(util.WORKSPACE_EVENTS.clientDisconnected, removeClientHandler);

tableWS.mergeStyle({ background: 'darkGreen' });
tableWS.set('role', 'tableWS');
//tableWS.on('pan', handlePan);

tableElement.mergeShape({ w: 150, h: 200 });
tableElement.on('pan', handlePan);

tableWS.addElement(tableElement);
mainWS.addElement(tableWS);
