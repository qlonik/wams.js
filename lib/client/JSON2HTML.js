var _ = require('lodash'),

   util = require('../util');

/*
Objects that are accepted:
{
   tag: String,
   attr: {
      id: String,
      class: String|[String, String, ...],
      custom: String|[String, String, ...],
      data-custom: String,
      ...
   },
   inner: String|{...}|[{...}, {...}, ...]
}
or
[{...}, {...}, {...}, ...]

tag is required,
attr is optional
   parameters inside attribute are all optional,
   one of parameters can be Array of Strings, in this case, it is concatenated with spaces,
inner is optional
   inner can be String or HTMLString or it can have the same structure as main json
 */

/**
 * Takes one json object and returns one html element
 * @param metadata
 * @returns {HTMLElement}
 */
function createAndPopulateNode(metadata) {
   var node = document.createElement(metadata.tag);

   if (_.isPlainObject(metadata.attr)) {
      _.forOwn(metadata.attr, function (value, key) {
         if (_.isArray(value)) {
            value = value.join(' ');
         }
         node.setAttribute(key, value);
      });
   }

   if (_.isPlainObject(metadata.style)) {
      _.forOwn(metadata.style, function (value, key) {
         node.style[key] = value;
      });
   }

   function createAndAppendChild(child) {
      var childNode = createAndPopulateNode(child);
      node.appendChild(childNode);
   }

   if (_.isString(metadata.inner)) {
      node.innerHTML = metadata.inner;
   } else if (_.isPlainObject(metadata.inner)) {
      createAndAppendChild(metadata.inner);
   } else if (_.isArray(metadata.inner)) {
      _.forEach(metadata.inner, createAndAppendChild);
   }

   return node;
}

function JSON2HTML(json, opts) {
   if (_.isString(json)) {
      json = JSON.parse(json);
   }

   var nodes;
   if (_.isPlainObject(json)) {
      nodes = createAndPopulateNode(json);
   } else if (_.isArray(json)) {
      _.forEach(json, function (tag) {
         nodes = util.elemOrArray(nodes, createAndPopulateNode(tag));
      });
   }

   return nodes;
}

module.exports = exports = JSON2HTML;