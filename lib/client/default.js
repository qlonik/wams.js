var $ = require('jquery'),

   WAMS = require('./');

window.WAMS = WAMS;

var wams = WAMS();
wams.getWorkspaceHTML(function(html) {
   html.style.width = window.innerWidth + 'px';
   html.style.height = window.innerHeight + 'px';
   document.body.appendChild(html);
//   console.log(html);

   var interactive = wams.createInteractiveElement(html);
   WAMS.HAMMER_EVENTS.forEach(function(eventType) {
      interactive.on(eventType, function(ev) {
         wams.emitInteractiveEvent(ev);
      });
   });


//   html = $(html);
//
//   html.width(window.innerWidth);
//   html.height(window.innerHeight);
//
//   $('body').append(html);
});

//wams.getWorkspaceJSON(function(json) {
//   console.log(json);
//});