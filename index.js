const udp          = require('dgram');
const util         = require('util');
const EventEmitter = require('events');
const Packet       = require('./packet');
/**
 * [SSDP description]
 * @param {[type]} options [description]
 * @rfc https://tools.ietf.org/html/draft-cai-ssdp-v1-03
 */
function SSDP(options){
  if(!(this instanceof SSDP)){
    return new SSDP(options);
  }
  EventEmitter.call(this);
  var defaults = {
    port     : 1900,
    multicast: '239.255.255.250'
  };
  for(var k in options){
    defaults[ k ] = options[ k ];
  }
  this.options = defaults;
  this.isBound = false
  this.socket = udp.createSocket('udp4');
  this.socket.on('message', function(data, rinfo){
    var response = Packet.parse(data);
    response.remote = rinfo;
    this.emit('response', response);
  }.bind(this));
  this.socket.on('listening', () => {
    this.isBound = true
  })
  this.socket.on('close', () => {
    this.isBound = false
  })
  return this;
};

util.inherits(SSDP, EventEmitter);

/**
 * [listen description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
SSDP.prototype.listen = function(callback){
  const { port, multicast } = this.options;
  this.socket.bind(port, function(err){
    this.setBroadcast(true);
    this.addMembership(multicast);
    callback && callback(err);
  });
  return this;
};

/**
 * [search description]
 * @param  {[type]} path    [description]
 * @param  {[type]} headers [description]
 * @return {[type]}         [description]
 */
SSDP.prototype.search = function(serviceType){
  if(this.isBound === false){
    return this.listen(this.search.bind(this, serviceType));
  }
  const request = new Packet(Packet.METHODS.SEARCH, {
    ST: serviceType
  });
  return this.send(request);
};

/**
 * [send description]
 * @param  {[type]} method  [description]
 * @param  {[type]} path    [description]
 * @param  {[type]} headers [description]
 * @return {[type]}         [description]
 */
SSDP.prototype.send = function(request) {
  const { port, multicast } = this.options;
  const message = request.toBuffer();
  this.socket.send(message, 0, message.length, port, multicast);
  return this;
};

/**
 * [close description]
 * @return {[type]} [description]
 */
SSDP.prototype.close = function(){
  this.socket.close();
  return this;
};

/**
 * [Server description]
 * @type {[type]}
 */
SSDP.Server = require('./server');
SSDP.createServer = function(options){
  return new SSDP.Server(options);
};

module.exports = SSDP;
