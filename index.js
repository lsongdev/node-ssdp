const udp          = require('dgram');
const util         = require('util');
const EventEmitter = require('events');
const Packet       = require('./packet');
/**
 * [Discovery description]
 * @param {[type]} options [description]
 */
function Discovery(options){
  if(!(this instanceof Discovery)){
    return new Discovery(options);
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

util.inherits(Discovery, EventEmitter);

/**
 * [parse description]
 * @param  {[type]} data  [description]
 * @param  {[type]} rinfo [description]
 * @return {[type]}       [description]
 */

/**
 * [listen description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Discovery.prototype.listen = function(callback){
  this.socket.bind(this.options.port, function(err) {
    this.setBroadcast(true);
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
Discovery.prototype.search = function(serviceType){
  if(this.socket._bindState === 0){
    return this.listen(function(){
      this.search(serviceType);
    }.bind(this));
  };
  var request = new Packet(Packet.SEARCH, {
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
Discovery.prototype.send = function(request) {
  var message = request.toBuffer();
  this.socket.send(message, 0, message.length, 
    this.options.port, this.options.multicast);
  return this;
};

module.exports = Discovery;