const Discovery = require('..');

var ssdp = new Discovery();

ssdp.listen(function(err){
  
  ssdp.search('*', {
    MAN: 'ssdp:discover',
    ST : 'wifi_bulb'
  });
  
});