const udp          = require('dgram');
const util         = require('util');
const EventEmitter = require('events');
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
  this.socket.on('message', this.parse.bind(this));
  return this;
};

util.inherits(Discovery, EventEmitter);
/**
 * [escape description]
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
Discovery.escape = function(str){
  if(/[:|\s]/.test(str)) 
    return '"' + str + '"';
  return str;
};
/**
 * [parse description]
 * @param  {[type]} data  [description]
 * @param  {[type]} rinfo [description]
 * @return {[type]}       [description]
 */
Discovery.prototype.parse = function(data, rinfo){
  var lines = data.toString().split('\r\n');
  var message = lines.shift();
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
Discovery.prototype.search = function(path, headers){
  var method = 'M-SEARCH';
  path = path || '*';
  headers = headers || {};
  return this.send(method, path, headers);
};
/**
 * [send description]
 * @param  {[type]} method  [description]
 * @param  {[type]} path    [description]
 * @param  {[type]} headers [description]
 * @return {[type]}         [description]
 */
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
  request.push(null);
  var message = new Buffer(request.join('\r\n'));
  this.socket.send(message, 0, message.length, 
    this.options.port, this.options.multicast);
  return this;
};

module.exports = Discovery;