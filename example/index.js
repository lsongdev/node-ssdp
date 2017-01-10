const ssdp = require('..')({ 
  port: 1982
});

ssdp.on('response', function(response){
  console.log(response);
});

ssdp.listen();
ssdp.search('*', {
  MAN: 'ssdp:discover',
  ST : 'wifi_bulb'
});