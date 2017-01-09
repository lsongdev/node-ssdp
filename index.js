const udp          = require('dgram');
const util         = require('util');
const EventEmitter = require('events');

/**
 * [Discovery description]
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
  this.socket.on('message', this.process.bind(this));
  return this;
};

util.inherits(Discovery, EventEmitter);

Discovery.prototype.process = function(message, rinfo){
  console.log(message, rinfo);
  return this;
};

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
}
/**
 * [send description]
 * @param  {[type]} method  [description]
 * @param  {[type]} path    [description]
 * @param  {[type]} headers [description]
 * @return {[type]}         [description]
 */
Discovery.prototype.send = function(method, path, headers){
  var request = [
    [ method, path, 'HTTP/1.1' ].join(' ')
  ];
  Object.keys(headers).forEach(name => {
    request.push([ name, Discovery.escape(headers[ name ]) ].join(': '));
  });
  request.push();
  var message = new Buffer(request.join('\r\n'));
  this.socket.send(message, 0, message.length,
    this.options.port, this.options.multicast, function(){});
  return this;
};
/**
 * [listen description]
 * @param  {[type]}   port     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Discovery.prototype.listen = function(port, callback){
  if(typeof port === 'function'){
    callback = port; port = null;
  }
  var err = null;
  port = port || this.options.port;
  try{
    this.socket.bind(port, function(err){
      this.setBroadcast(true);
    });
  }catch(e){
    err = e;
  }
  callback && callback(err);
  return this;
};

module.exports = Discovery;