const udp = require('dgram');

function Discovery(options){
  this.socket = udp.createSocket('udp4');
  this.socket.on('message', function(message, address) {
    console.log(message, address);
  }.bind(this));
};

Discovery.prototype.listen = function(port, callback){
  this.socket.bind(port, function(err) {
    this.setBroadcast(true);
    callback && callback(err, port);
  });
};

Discovery.prototype.search = function(path, headers, callback) {
  var buffer = new Buffer('M-SEARCH * HTTP/1.1\r\nMAN: \"ssdp:discover\"\r\nST: wifi_bulb\r\n');
  this.socket.send(buffer, 0, buffer.length, 1982, '239.255.255.250');
};

module.exports = Discovery;