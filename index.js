const udp = require('dgram');
const EventEmitter = require('events');
const Packet = require('./packet');

/**
 * [SSDP description]
 * @param {[type]} options [description]
 * @rfc https://tools.ietf.org/html/draft-cai-ssdp-v1-03
 */
class SSDP extends EventEmitter {
  constructor(options) {
    super();
    this.options = Object.assign({}, {
      port: 1900,
      multicast: '239.255.255.250'
    }, options);
    this.isBound = false
    this.socket = udp.createSocket('udp4');
    this.socket.on('message', function (data, rinfo) {
      var response = Packet.parse(data);
      response.remote = rinfo;
      this.emit('response', response);
    }.bind(this));
    this.socket.on('listening', () => {
      this.isBound = true;
    })
    this.socket.on('close', () => {
      this.isBound = false;
    })
    return this;
  }
  /**
   * [listen description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  async listen() {
    const { port, multicast } = this.options;
    return new Promise((resolve, reject) => {
      this.socket.bind(port, function (err) {
        if (err) return reject(err);
        this.setBroadcast(true);
        this.addMembership(multicast);
        resolve(this);
      });
    })
  }
  /**
   * [search description]
   * @param  {[type]} path    [description]
   * @param  {[type]} headers [description]
   * @return {[type]}         [description]
   */
  async search(serviceType) {
    if (!this.isBound) await this.listen();
    const request = new Packet(Packet.METHODS.SEARCH, {
      ST: serviceType
    });
    return this.send(request);
  }
  /**
   * [send description]
   * @param  {[type]} method  [description]
   * @param  {[type]} path    [description]
   * @param  {[type]} headers [description]
   * @return {[type]}         [description]
   */
  send(request) {
    const { port, multicast } = this.options;
    const message = request.toBuffer();
    this.socket.send(message, 0, message.length, port, multicast);
    return this;
  }
  close() {
    this.socket.close();
    return this;
  }
}

/**
 * [Server description]
 * @type {[type]}
 */
SSDP.Server = require('./server');
SSDP.createServer = function (options) {
  return new SSDP.Server(options);
};

module.exports = SSDP;
