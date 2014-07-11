var http = require('http'),
   path = require('path'),
   EventEmitter = require('events').EventEmitter,

   _ = require('lodash'),
   express = require('express'),
   socket_io = require('socket.io'),
   morgan = require('morgan'),
   racerBrowserChannel = require('racer-browserchannel'),
   debug = require('debug'),
   logExpress = debug('wams:express'),
   logSocket = debug('wams:socket'),

   util = require('../util'),
   clientCreator = require('./Client'),
   allRouter = require('./routers'),
   networkPathRouter = require('./routers/netPath');

var DEFAULT_OPTS = {
   port: 3000,
   networkPath: '/wams',
   static: path.join(__dirname, 'public')
};

function Serv(wams, opts) {
   EventEmitter.call(this);
   this.wams = wams;
   var _this = this;

   if (_.isUndefined(opts)) {
      opts = {};
   } else if (_.isNumber(opts)) {
      opts = { port: opts };
   }

   this.opts = _.defaults(opts, DEFAULT_OPTS);
   this.app = express();

   // settings
   this.app.set('port', this.opts.port);

   // middleware
   this.app.use(morgan('dev')); //enable logger
//   this.app.use(bodyParser.json());
//   this.app.use(bodyParser.urlencoded());
//   this.app.use(cookieParser());
   this.app.use(racerBrowserChannel(this.wams.racer.store));
   this.app.use(express.static(path.resolve(this.opts.static)));

   // routers
   this.app.use('/', allRouter(this));
   this.app.use(this.opts.networkPath, networkPathRouter(this));

   this.srv = http
      .createServer(this.app)
      .listen(this.app.get('port'), function () {
         logExpress('Server started on port ' + this.address().port);
      });

   this.clients = [];

   this.io = socket_io(this.srv);
   this.io.on('connection', function(socket) {
      logSocket('New client connected');

      var client = new clientCreator(_this, _this.wams.racer, socket);
      _this.clients.push(client);

      socket.on('disconnect', function() {
         _.remove(_this.clients, client);
      });
   });
}

_.merge(Serv.prototype, EventEmitter.prototype);

Serv.prototype.getClient = function(param) {
   return _.find(this.clients, function(client) {
      return client.equal(param);
   });
};

module.exports = exports = Serv;