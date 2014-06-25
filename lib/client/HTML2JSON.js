var _ = require('lodash');

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

   if (html.children.length) {
      _.forEach(html.children, function (childNode) {
         if (_.isUndefined(result.inner)) {
            result.inner = createJSON(childNode);
         } else if (_.isArray(result.inner)) {
            result.inner.push(createJSON(childNode));
         } else {
            result.inner = [result.inner, createJSON(childNode)];
         }
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
         if (_.isUndefined(json)) {
            json = createJSON(tag);
         } else if (_.isArray(json)) {
            json.push(createJSON(tag));
         } else {
            json = [json, createJSON(tag)];
         }
      });
   } else {
      json = createJSON(html);
   }

   return json;
}

module.exports = exports = HTML2JSON;