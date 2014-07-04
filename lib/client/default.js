var $ = require('jquery'),

   WAMS = require('./');

var wams = WAMS();
wams.getWorkspaceHTML(function(html) {
//   console.log(html);
   html = $(html);

   html.width(window.innerWidth);
   html.height(window.innerHeight);

   $('body').append(html);
});

//wams.getWorkspaceJSON(function(json) {
//   console.log(json);
//});