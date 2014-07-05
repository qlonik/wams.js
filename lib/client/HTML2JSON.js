var _ = require('lodash'),

   util = require('../util');

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

   return _.difference(html, _.uniq(toDelete));
}

/**
 * Takes ones html element and returns one json object
 * @param html
 * @returns {{}}
 */
function createJSON(html) {
   var result = {};

   result.tag = html.tagName.toLowerCase();

   if (html.attributes.length) {
      result.attr = {};
      _.forEach(html.attributes, function (value) {
         result.attr[value.nodeName] = value.nodeValue;

         if (value.nodeName === 'class' &&
            result.attr[value.nodeName].indexOf(' ') > -1) {
            result.attr[value.nodeName] = result.attr[value.nodeName].split(' ');
         }
      });
   }

   if (html.style.length) {
      result.style = {};
      _.forEach(html.style, function (value) {
         result.style[value] = html.style[value];
      });
   }

   if (html.children.length) {
      _.forEach(html.children, function (childNode) {
         result.inner = util.elemOrArray(result.inner, createJSON(childNode));
      });
   } else {
      result.inner = html.innerHTML;
   }

   return result;
}

function HTML2JSON(html) {
   if (_.isString(html)) {
      var div = document.createElement('div');
      div.innerHTML = html;
      html = div.children;
   }
   var json;

   if (html.length) {
      html = removeAllChildren(html);
      _.forEach(html, function (tag) {
         json = util.elemOrArray(json, createJSON(tag));
      });
   } else {
      json = createJSON(html);
   }

   return json;
}

module.exports = exports = HTML2JSON;