const udp          = require('dgram');
const util         = require('util');
const EventEmitter = require('events');
const Packet       = require('./packet');
/**
 * [SSDP description]
 * @param {[type]} options [description]
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
  this.socket = udp.createSocket('udp4');
  this.socket.on('message', function(data, rinfo){
    var response = Packet.parse(data);
    response.remote = rinfo;
    this.emit('response', response);
  }.bind(this));
  return this;
};

util.inherits(SSDP, EventEmitter);

/**
 * [listen description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
SSDP.prototype.listen = function(callback){
  var self = this;
  this.socket.bind(this.options.port, function(err) {
    this.setBroadcast(true);
    this.addMembership(self.options.multicast);
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
  if(this.socket._bindState === 0){
    return this.listen(function(){
      this.search(serviceType);
    }.bind(this));
  };
  var request = new Packet(Packet.METHODS.SEARCH, {
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
  var message = request.toBuffer();
  this.socket.send(message, 0, message.length, 
    this.options.port, this.options.multicast);
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

SSDP.Server = require('./server');
SSDP.createServer = function(){
  return new SSDP.Server();
};

module.exports = SSDP;
