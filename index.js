const udp          = require('dgram');
const util         = require('util');
const EventEmitter = require('events');

function Discovery(options){
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
  this.socket.on('message', this.parse.bind(this));
  return this;
};

util.inherits(Discovery, EventEmitter);

Discovery.escape = function(str){
  if(/[:|\s]/.test(str)) 
    return '"' + str + '"';
  return str;
};

Discovery.prototype.parse = function(message, rinfo){
  var lines = message.toString().split('\r\n');
  var message = lines.splice(0, 1);
  var status  = message.split(' ');
  var headers = {};
  lines.filter(function(line){
    return !!line.trim();
  }).forEach(function(line){
    var m = line.match(/(\w+):\s+?(.*)/);
    headers[ m[1] ] = m[2];
  });
  var response = {
    remote    : rinfo,
    version   : status[0],
    statusCode: status[1],
    statusText: status[2],
    headers   : headers
  };
  this.emit('response', response);
  return this;
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
  path    = path    || '*';
  headers = headers || {};
  method  = method  || 'M-SEARCH';
  var request = [
    [ method, path, 'HTTP/1.1' ].join(' ')
  ];
  Object.keys(headers).forEach(name => {
    request.push([ name, Discovery.escape(headers[ name ]) ].join(': '));
  });
  request.push();
  // var message = new Buffer(request.join('\r\n'));
  var message = new Buffer('M-SEARCH * HTTP/1.1\r\nMAN: \"ssdp:discover\"\r\nST: wifi_bulb\r\n');
  this.socket.send(message, 0, message.length, 1982, '239.255.255.250');
  return this;
};

module.exports = Discovery;