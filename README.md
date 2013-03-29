
# log

Stream client side logs over a websocket (with http post fallback)

## Installation

```sh
$ component install CamShaft/log
```

## API

```js
require("log").connect("ws://localhost:5000", {
  debug: true
});

console.log("this is a test");
// 70 <0>1 2013-03-29T07:13:55.680Z localhost app browser - - this is a test

throw new Error("There's an error");
// 176 <0>1 2013-03-29T07:12:33.635Z localhost app browser - - error="Uncaught Error: There's an error" url=http://localhost:5000 line=19
```

## License

MIT
