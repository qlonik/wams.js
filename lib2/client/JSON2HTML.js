var util = require('../util');

var DEFAULT_OPTS = {
   tag: 'tag',
   attr: 'attr',
   style: 'style',
   inner: 'inner'
};

/*
Objects that are accepted:
{
   tag: String,
   attr: {
      id: String,
      class: String|[String, String, ...],
      style: String|[String, String, ...],
      custom: String|[String, String, ...],
      data-custom: String|[String, String, ...],
      ...
   },
   style: {
      background: String,
      position: String,
      key: String,
      ...
   },
   inner: String|{...}|[String|{...}, String|{...}, ...]
}
or
{
   data: String|{...}|[String|{...}, String|{...}, ...],
   opts: {
      tag: String,
      attr: String,
      style: String,
      inner: String
   }
}
or
[
   String|{...},
   String|{...},
   ...
]

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
 * Convert {@link String} into html element
 * @param {String} metadata String to convert
 * @returns {Array} Array of html elements
 */
function parseHTMLString(metadata) {
   var tmpDiv = document.createElement('div');
   tmpDiv.innerHTML = metadata;

   return Array.prototype.slice.call(tmpDiv.childNodes);
}

/**
 * Takes one String, Object or Array and return Array of html elements
 * @param {String|Object|Array} metadata Input object
 * @param {{tag:String, attr:String, style:String, inner:String}} opts Options of this object
 * @returns {[]} Array of html elements
 */
function createAndPopulateNode(metadata, opts) {
   if (util.isString(metadata)) {
      return parseHTMLString(metadata);
   } else {
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
         util.forEach(childNode, function(el) {
            node.appendChild(el);
         });
      }

      if (util.isArray(metadata[inner])) {
         util.forEach(metadata[inner], createAndAppendChild);
      } else if (util.isString(metadata[inner]) ||
         util.isPlainObject(metadata[inner])) {
         createAndAppendChild(metadata[inner]);
      }

      return [node];
   }
}

/**
 * Take json structure and convert to array of html elements
 * @param {String|Object|Array} json Structure to convert
 * @param {Object} opts Options for this converter
 * @returns {Array} Array of html elements
 * @constructor
 */
function JSON2HTML(json, opts) {
   var data = {}, settings = {}, convertedNode,
      result = [];

   data = json.data || json || data;
   util.defaults(settings, opts, json.opts, DEFAULT_OPTS);

   if (util.isString(data)) {
      try {
         data = JSON.parse(data);
      } catch (e) {
         if (!(e instanceof SyntaxError)) {
            throw e;
         }
      }
   }

   if (util.isEmpty(data)) {
      return [];
   }

   function convertAndPush(el) {
      convertedNode = createAndPopulateNode(el, settings);
      Array.prototype.push.apply(result, convertedNode);
   }

   if (util.isArray(data)) {
      util.forEach(data, convertAndPush);
   } else {
      convertAndPush(data);
   }

   return result;
}

module.exports = exports = JSON2HTML;