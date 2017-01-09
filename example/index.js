const Discovery = require('..');

var ssdp = new Discovery();

ssdp.listen(1982, function(err){
  
  ssdp.search('*', {
    MAN: 'ssdp:discover',
    ST : 'wifi_bulb'
  });
  
});