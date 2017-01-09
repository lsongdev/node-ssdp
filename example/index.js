const Discovery = require('..');

var ssdp = new Discovery();

ssdp.on('response', function(response){
  console.log(response);
});

ssdp.listen(function(err){
  
  ssdp.search('*', {
    MAN: 'ssdp:discover',
    ST : 'wifi_bulb'
  });
  
});