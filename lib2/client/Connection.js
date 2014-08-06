var io = require('socket.io-client'),

   util = require('../util');

var SOCKET_EVENTS = util.SOCKET_EVENTS;

function Connection() {
   this.socket = io();
}

// merge all methods from socket.io Socket to Connection class
util.forOwn(io.Socket.prototype, function(func, name) {
   Connection.prototype[name] = function() {
      func.apply(this.socket, Array.prototype.slice.call(arguments));
   }
});

module.exports = Connection;