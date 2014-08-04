var util = require('../util');

/*
Accepted: regular HTML objects or jQuery objects

IMPORTANT NOTE:
   If it happens that in element passed HTML collection is child of
   one of the elements in that collection, this child element will be deleted
   from collection and therefore from result.

   Example: if we have this structure in html:
   <div id='outer' class='div'>
      <p class='test'>HI</p>
      <div id='inner' class='div'>
         <a href='example.com'>Example.com</a>
      </div>
   </div>

   and if in JavaScript you use this line to get html elements:
   var elements = document.getElementsByClassName('div');

   It will return this object (shortened):
   [
      <div id='outer' class='div'>...</div>,
      <div id='inner' class-'div'>...</div>
   ]

   In this case, element
   <div id='inner' ..>...</div>
   will be deleted from collection when we will be converting it to JSON.
 */

function removeAllChildren(html) {
   var i, j,
      toDelete = [];

   for (i = html.length - 1; i >= 1; i--) {
      for (j = i - 1; j >= 0; j--) {
         if (html[j].compareDocumentPosition(html[i]) &
            Node.DOCUMENT_POSITION_CONTAINED_BY) {
            toDelete.push(html[i]);
         }
      }
   }

   return util.difference(html, util.uniq(toDelete));
}

/**
 * Takes ones html element and returns one json object
 * @param html
 * @param opts
 * @returns {*[]}
 */
function createJSON(html, opts) {
   var tag = opts.tag, attr = opts.attr, style = opts.style, inner = opts.inner,
      result = {};

      result[tag] = html.tagName.toLowerCase();

      if (html.attributes.length) {
         result[attr] = {};
         util.forEach(html.attributes, function(value) {
            var name = value.name;
            if (name !== 'style') {
               result[attr][name] = value.value;

               if (name === 'class' && result[attr][name].indexOf(' ') > -1) {
                  result[attr][name] = result[attr][name].split(' ');
               }
            }
         });
      }

      if (html.style.length) {
         result[style] = {};
         util.forEach(html.style, function(value) {
            result[style][value] = html.style[value];
         });
      }

      if (html.childNodes.length) {
         result[inner] = [];
         util.forEach(html.childNodes, function(childNode) {
            var createdJSON = createJSON(childNode, opts);
            Array.prototype.push.apply(result[inner], createdJSON);
         });
      } else {
         result[inner] = html.innerHTML; // should never reach
      }

   return [result];
}

function HTML2JSON(html) {
   if (util.isString(html)) {
      var div = document.createElement('div');
      div.innerHTML = html;
      html = div.children;
   }
   var json;

   if (html.length) {
      html = removeAllChildren(html);
      util.forEach(html, function (tag) {
         json = util.elemOrArray(json, createJSON(tag));
      });
   } else {
      json = createJSON(html);
   }

   return json;
}

module.exports = exports = HTML2JSON;
