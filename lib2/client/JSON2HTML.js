var util = require('../util');

/*
Objects that are accepted:
{
   tag: String,
   attr: {
      id: String,
      class: String|[String, String, ...],
      style: String|[String, String, ...],
      custom: String|[String, String, ...],
      data-custom: String,
      ...
   },
   style: {
      background: String,
      position: String,
      key: String,
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
   can pass style as attribute,
style is optional
   style string can be passed inside attr as attribute, or can be inside style field,
   this style field takes over style string in attr,
inner is optional
   inner can be String or HTMLString or it can have the same structure as main json
 */

/**
 * Takes one json object and returns one html element
 * @param metadata
 * @param opts
 * @returns {HTMLElement}
 */
function createAndPopulateNode(metadata, opts) {
      var tag = opts.tag, attr = opts.attr, style = opts.style, inner = opts.inner,
         node = document.createElement(metadata[tag]);

      if (util.isPlainObject(metadata[attr])) {
         util.forOwn(metadata[attr], function (value, key) {
            if (util.isArray(value)) {
               value = value.join(' ');
            }
            node.setAttribute(key, value);
         });
      }

      if (util.isPlainObject(metadata[style])) {
         util.forOwn(metadata[style], function (value, key) {
            node.style[key] = value;
         });
      }

      function createAndAppendChild(child) {
         var childNode = createAndPopulateNode(child, opts);
         node.appendChild(childNode);
      }

      if (util.isString(metadata[inner])) {
         node.innerHTML = metadata[inner];
      } else if (util.isPlainObject(metadata[inner])) {
         createAndAppendChild(metadata[inner]);
      } else if (util.isArray(metadata[inner])) {
         util.forEach(metadata[inner], createAndAppendChild);
      }

      return node;
}

function JSON2HTML(json, opts) {
   if (util.isString(json)) {
      json = JSON.parse(json);
   }

   var nodes;
   if (util.isPlainObject(json)) {
      nodes = createAndPopulateNode(json);
   } else if (util.isArray(json)) {
      util.forEach(json, function (tag) {
         nodes = util.elemOrArray(nodes, createAndPopulateNode(tag));
      });
   }

   return nodes;
}

module.exports = exports = JSON2HTML;