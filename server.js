const udp          = require('dgram');
const util         = require('util');
const EventEmitter = require('events');


function Server(){
  EventEmitter.call(this);
}

util.inherits(Server, EventEmitter);

module.exports = Server;