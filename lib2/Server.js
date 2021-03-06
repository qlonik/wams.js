var http = require('http'),
   path = require('path'),
   EventEmitter = require('events').EventEmitter,

   express = require('express'),
   socket_io = require('socket.io'),
   morgan = require('morgan'),
   racerBrowserChannel = require('racer-browserchannel'),
   debug = require('debug'),
   logExpress = debug('wams:express'),
   logSocket = debug('wams:socket'),

   util = require('./util'),
   allRouter = require('./routers'),
   networkPathRouter = require('./routers/netPath');

var DEFAULT_OPTS = {
      port: 3000,
      networkPath: '/wams',
      static: []
   },
   STATIC_FOLDER = path.join(__dirname, 'public'),
   SERVER_EVENTS = util.SERVER_EVENTS;

function Serv(store, opts) {
   EventEmitter.call(this);
   this.store = store;
   var _this = this;

   if (util.isUndefined(opts)) {
      opts = {};
   } else if (util.isNumber(opts)) {
      opts = { port: opts };
   }

   this.sockets = [];
   this.opts = util.defaults(opts, DEFAULT_OPTS);
   this.app = express();

   // settings
   this.app.set('port', this.opts.port);

   // middleware
   this.app.use(morgan('dev')); //enable logger
//   this.app.use(bodyParser.json());
//   this.app.use(bodyParser.urlencoded());
//   this.app.use(cookieParser());
   this.app.use(racerBrowserChannel(this.store));
   this.app.use(express.static(path.resolve(STATIC_FOLDER)));
   if (util.isString(_this.opts.static)) {
      _this.app.use(express.static(path.resolve(_this.opts.static)));
   } else if (util.isArray(_this.opts.static)) {
      util.forEach(_this.opts.static, function(staticPath) {
         _this.app.use(express.static(path.resolve(staticPath)));
      });
   }

   // routers
   this.app.use('/', allRouter(this));
   this.app.use(this.opts.networkPath, networkPathRouter(this));

   this.srv = http
      .createServer(this.app)
      .listen(this.app.get('port'), function () {
         logExpress('Server started on port ' + this.address().port);
      });

   this.io = socket_io(this.srv);
   this.io.on('connection', function(socket) {
      logSocket('New client connected');
      _this.sockets.push(socket);
      _this.emit(SERVER_EVENTS.connectClient, null, socket);

      socket.on('disconnect', function() {
         util.remove(_this.sockets, socket);
         _this.emit(SERVER_EVENTS.disconnectClient, null, socket);
      });
   });
}

util.merge(Serv.prototype, EventEmitter.prototype);

module.exports = exports = Serv;