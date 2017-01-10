
/**
 * [Packet description]
 * @param {[type]} method  [description]
 * @param {[type]} headers [description]
 */
function Packet(method, headers, path){
  this.path    = path   || '*';
  this.method  = method || Packet.METHODS.SEARCH;
  this.headers = {
    MAN: 'ssdp:discover'
  };
  for(var header in headers){
    this.headers[ header ] = headers[ header ];
  }
  return this;
}

Packet.METHODS = {
  SEARCH: 'M-SEARCH',
  NOTIFY: 'NOTIFY'
};

/**
 * [escape description]
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
Packet.escape = function(str){
  if(/[:|\s]/.test(str)) 
    return '"' + str + '"';
  return str;
};

/**
 * [parse description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
Packet.parse = function(data){
  var response = new Packet();
  var lines = data.toString().split('\r\n');
  var message = lines.shift();
  var status  = message.split(' ');
  lines.filter(function(line){
    return !!line.trim();
  }).forEach(function(line){
    var m = line.match(/(\w+):\s+?(.*)/);
    response.headers[ m[1] ] = m[2];
  });
  response.version    = status[0];
  response.statusCode = status[1];
  response.statusText = status[2];
  return response;
};

/**
 * [toBuffer description]
 * @return {[type]} [description]
 */
Packet.prototype.toBuffer = function(){
  var request = [
    [ this.method, this.path, 'HTTP/1.1' ].join(' ')
  ];
  Object.keys(this.headers).forEach(name => {
    request.push([ name, Packet.escape(this.headers[ name ]) ].join(': '));
  });
  request.push(null);
  return new Buffer(request.join('\r\n'));
};

module.exports = Packet;