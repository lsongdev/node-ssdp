const udp          = require('dgram');
const util         = require('util');
const EventEmitter = require('events');

function Discovery(options){
  EventEmitter.call(this);
  this.socket = udp.createSocket('udp4');
  this.socket.on('message', this.parse.bind(this));
};

util.inherits(Discovery, EventEmitter);

Discovery.prototype.parse = function(message, rinfo){
  var lines = message.toString().split('\r\n');
  console.log(lines);
};

Discovery.prototype.listen = function(port, callback){
  this.socket.bind(port, function(err) {
    this.setBroadcast(true);
    callback && callback(err, port);
  });
};

Discovery.prototype.search = function(path, headers){
  var method = 'M-SEARCH';
  path = path || '*';
  headers = headers || {};
  return this.send(method, path, headers);
};

Discovery.prototype.send = function(method, path, headers) {
  var buffer = new Buffer('M-SEARCH * HTTP/1.1\r\nMAN: \"ssdp:discover\"\r\nST: wifi_bulb\r\n');
  this.socket.send(buffer, 0, buffer.length, 1982, '239.255.255.250');
  return this;
};

module.exports = Discovery;