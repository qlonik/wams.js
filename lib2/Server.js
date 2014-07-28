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
      static: 'public'
   },
   SERVER_EVENTS = util.SERVER_EVENTS;

function Serv(racer, opts) {
   EventEmitter.call(this);
   this.racer = racer;
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
   this.app.use(racerBrowserChannel(this.racer.store));
   this.app.use(express.static(path.resolve(this.opts.static)));

   // routers
   this.app.use('/', allRouter(this));
   this.app.use(this.opts.networkPath, networkPathRouter(this));

   this.srv = http
      .createServer(this.app)
      .listen(this.app.get('port'), function () {
         logExpress('Server started on port ' + this.address().port);
      });

   this.io = socket_io(this.srv);
}

util.merge(Serv.prototype, EventEmitter.prototype);

module.exports = exports = Serv;