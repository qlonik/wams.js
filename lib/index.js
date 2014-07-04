var Workspace = require('./server/Workspace');
module.exports = function(port) {
   return new Workspace(port);
};