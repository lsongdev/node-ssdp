
/**
 * [Packet description]
 * @param {[type]} method  [description]
 * @param {[type]} headers [description]
 * @rfc https://tools.ietf.org/html/draft-cai-ssdp-v1-03
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
  lines.filter(Boolean).forEach(function(line){
    const [ _, name, value ] = line.match(/(\w+):\s+?(.*)/);
    response.headers[name] = value;
  });
  response.statusCode = status[0];
  response.statusText = status[1];
  response.version    = status[2];
  return response;
};

/**
 * [toBuffer description]
 * @return {[type]} [description]
 */
Packet.prototype.toBuffer = function(){
  const EOL = '\r\n';
  const { method, path } = this;
  let request = `${method} ${path} HTTP/1.1${EOL}`;
  Object.keys(this.headers).forEach(name => {
    const value = Packet.escape(this.headers[ name ]);
    request += `${name}: ${value}${EOL}`;
  });
  request += EOL;
  request += EOL;
  return Buffer.from(request);
};

module.exports = Packet;
