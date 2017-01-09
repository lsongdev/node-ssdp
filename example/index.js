const Discovery = require('..');

var ssdp = new Discovery();

ssdp.on('response', function(response){
  console.log(response);
});

ssdp.listen(1982, function(err){
  
  ssdp.search('*', {
    MAN: 'ssdp:discover',
    ST : 'wifi_bulb'
  });
  
});