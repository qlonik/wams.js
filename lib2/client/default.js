var racer = require('racer'),

   WAMS = require('./'),
   util = WAMS.util;

var
   /**
    * Assist to convert regular shape to html and otherwise
    * @type {{x: string, y: string, w: string, h: string, left: string, top: string, width: string, height: string}}
    */
   R2H = {
      x: 'left',
      y: 'top',
      w: 'width',
      h: 'height',
      left: 'x',
      top: 'y',
      width: 'w',
      height: 'h'
   },
   DEBUG = false,
   wams = new WAMS(),
   mts = [];

window.WAMS = WAMS;
window.wams = wams;
window.racer = racer;
window.mts = mts;
wams.once(WAMS.util.BROWSER_EVENTS.modelFetched, function() {
   window.model = wams.model;
});

wams.getWorkspaceHTML(function (err, html) {
   if (err) { throw err; }

   document.body.appendChild(html);
   wams.emit('workspaceAttached');
});

wams.on('workspaceAttached', function() {
   var model = wams.model,
      /**
       * workspaces
       * @type {NodeList}
       */
      wss = document.getElementsByClassName(util.WORKSPACE_TYPE),
      /**
       * workspace objects
       * @type {NodeList}
       */
      wsos = document.getElementsByClassName(util.WORKSPACE_OBJECT_TYPE);

   /**
    * iterate over all workspace objects and attach hammer and model updater
    * @param wso Workspace object
    */
   function prepareWSObj(wso) {
      var listener, tmp = {}, mt = wams.createMTElement(wso), id = wso.id,
         wsoM = model.at(wams.path + '.' + util.WORKSPACE_OBJECT_TYPE + '.' + id),
         parentWS = wso.parentNode, wsID = parentWS.id,
         wsM = model.at(wams.path + '.' + util.WORKSPACE_TYPE + '.' + wsID);

      function prepare() {
         if (DEBUG && id !== wsoM.get('id')) {
            console.log(wsoM.get());
            throw new Error('ID mismatch\n' +
               'wso  = ' + id + '\n' +
               'wsoM = ' + wsoM.get('id'));
         }

         function startReportingEvents(val) {
            if (util.isString(val)) {
               mt.on(val, function (ev) {
                  if (DEBUG) {
                     console.log(val);
                  }
                  wams.sendMTEvent(ev);
               });
            } else {
               util.forEach(val, startReportingEvents);
            }
         }

         mts.push(mt);
         mt.modelListeners = [];

         util.forEach(util.HAMMER_EVENTS, startReportingEvents);
         mt.on('panstart', function (ev) {
            var boundRect = ev.target.getBoundingClientRect();
            var shapeM = wsoM.get('shape');

            tmp.x = boundRect.left;
            tmp.y = boundRect.top;
            tmp.mx = shapeM.x;
            tmp.my = shapeM.y;
         });
         mt.on('pan', function (ev) {
            var newX = tmp.x + ev.deltaX,
               newY = tmp.y + ev.deltaY,
               newMX = tmp.mx + ev.deltaX,
               newMY = tmp.my + ev.deltaY,
               i, wsInnerHtml = wsM.get('html.inner'),
               passing = {
                  clientSourceID: wams.id
               };

            i = util.findIndex(wsInnerHtml, function(html) {
               return (html.attr.id === id);
            });

            ev.target.style.left = newX + 'px';
            ev.target.style.top = newY + 'px';
            wsM.setDiff('html.inner.' + i + '.style.left', newX + 'px');
            wsM.setDiff('html.inner.' + i + '.style.top', newY + 'px');
//            wsM.pass(passing).setDiff('html.inner.' + i + '.style.left', newX + 'px');
//            wsM.pass(passing).setDiff('html.inner.' + i + '.style.top', newY + 'px');

            wsoM.setDiff('shape.x', newMX);
            wsoM.setDiff('shape.y', newMY);

//            wsoM.setDiff('shape.x', newX);
//            wsoM.setDiff('html.style.left', newX + 'px');
//            wsoM.setDiff('shape.y', newY);
//            wsoM.setDiff('html.style.top', newY + 'px');

            if (DEBUG && ev.target.id !== wso.id) {
               throw new Error("Panning object that does not match selected");
            }

            // In case we have few objects and for some reason we get error above
            // then we should use method below
//            var id = ev.target.id, wsoP = wams.path + '.' + util.WORKSPACE_OBJECT_TYPE + '.' + id;
//            model.setDiff(wsoP + '.shape.x', newX);
//            model.setDiff(wsoP + '.html.style.left', newX + 'px');
//            model.setDiff(wsoP + '.shape.y', newY);
//            model.setDiff(wsoP + '.html.style.top', newY + 'px');
         });
         mt.on('panend', function () {
            delete tmp.x;
            delete tmp.y;
            delete tmp.mx;
            delete tmp.my;
         });
         listener = wsoM.on('change', 'html.**', function (path, val, prev, passed) {
            var segments = path.split('.'), num,
               field = segments.shift(), key = segments.shift();

            if (field === 'style') {
               console.log(arguments);
               if (passed.$remote || (key !== 'left' && key !== 'top')) {
                  wso.style[key] = val;
//               num = +val.split('').slice(0, -2).join('');
//               wsoM.setDiff('shape.' + R2H[key], num);
               }
            } else if (field === 'attr') {
               if (util.isArray(val)) {
                  val = val.join(' ');
               }
               wso.setAttribute(key, val);
            } else {
               segments.unshift(field, key);
               console.log('ws Object model on \'html\' change');
               console.log(segments);
            }
         });
         mt.modelListeners.push({ev: 'change', listener: listener});
//         listener = wsoM.on('change', 'shape.**', function (path, val, prev, passed) {
//            var segments = path.split('.'), field = segments.shift();
//
//            wsoM.setDiff('html.style.' + R2H[field], val + 'px');
//         });
//         mt.modelListeners.push({ev: 'change', listener: listener});

         if (DEBUG) {
            listener = wsoM.on('all', '**', function () {
               console.log('wso ' + id + ' on all **');
               console.log(arguments);
            });
            mt.modelListeners.push({ev: 'all', listener: listener});
         }
      }

      if (wsoM.get()) {
         prepare();
      } else {
         setTimeout(prepare, 1000);
      }
   }
   util.forEach(wsos, prepareWSObj);
   util.forEach(wss,
      /**
       * interate over all workspaces
       * @param ws Workspace
       */
      function (ws) {
         var id = ws.id,
            wsM = model.at(wams.path + '.' + util.WORKSPACE_TYPE + '.' + id);

         wsM.on('all', 'html.inner', function (event, index, values, passed) {
            var i, j, k, wso, addedWsos, json, removed, el, mt, listener;

            if (event === 'insert') {
               for (i = 0; i < values.length; i++) {
                  json = values[i];
                  addedWsos = WAMS.JSON2HTML(json);

                  for (j = 0; j < addedWsos.length; j++) {
                     wso = addedWsos[j];
                     ws.appendChild(wso);
                     prepareWSObj(wso);
                  }
               }
            } else if (event === 'remove') {
               removed = [];
               for (i = 0; i < values.length; i++) {
                  json = values[i];
                  (function (jsonin) {
                     removed = util.remove(mts, function (mt) {
                        return (mt.element.id === jsonin.attr.id);
                     });
                  })(json);
                  for (j = 0; j < removed.length; j++) {
                     mt = removed[j];
                     el = mt.element;
                     for (k = 0; k < mt.modelListeners.length; k++) {
                        listener = mt.modelListeners[k];
                        model.removeListener(listener.ev, listener.listener);
                     }
                     el.parentElement.removeChild(el);
                  }
               }
            }
         });
         wsM.on('all', 'html.inner.*.style.**',
            function (index, path, ev, val, prev, passed) {
//               console.log(arguments);
               var elID = wsM.get('html.inner.' + index + '.attr.id'),
                  el = document.getElementById(elID);

               if (passed.$remote) {
                  if (path === 'left') {
                     el.style.left = val;
                  }
                  if (path === 'top') {
                     el.style.top = val;
                  }
               }
            });

         if (DEBUG) {
            wsM.on('all', '**', function () {
               console.log('ws ' + id + ' on all **');
               console.log(arguments);
            });
         }
      });
});
