const ssdp = require('..')({ 
  port: 1982
});

ssdp.on('response', function(response){
  console.log(response);
});

ssdp.search('wifi_bulb');