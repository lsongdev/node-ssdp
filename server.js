const udp          = require('dgram');
const EventEmitter = require('events');

class Server extends EventEmitter {
  constructor(){
    super();
    this.socket = udp.createSocket('udp4');
    this.socket.on('message', this.onMessage.bind(this));
  }
  listen(port){
    this.socket.bind(port);
  }
  onMessage(message, remote){
    this.emit('message', message, remote);
  }
}

module.exports = Server;