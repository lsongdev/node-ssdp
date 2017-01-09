## ssdp2 ![ssdp2@1.0.0](https://img.shields.io/npm/v/ssdp2.svg)

> ssdp

### Installation

```bash
$ npm i ssdp2
```

### Example

```js
const Discovery = require('ssdp2');

var ssdp = new Discovery();

ssdp.listen(function(err){
  
  ssdp.search('*', {
    MAN: 'ssdp:discover',
    ST : 'wifi_bulb'
  });
  
});

```

### Contributing
- Fork this Repo first
- Clone your Repo
- Install dependencies by `$ npm install`
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Publish your local branch, Open a pull request
- Enjoy hacking <3

### MIT

---