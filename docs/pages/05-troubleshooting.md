# Troubleshooting


## Testing
When testing your application with Jest, this error might show up: `crypto.getRandomValues() not supported`. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported for details.

To fix, added this to your jest setup file:
```js
const cryptoJest = require("crypto");
Object.defineProperty(global.self, "crypto", {
	value: {
		getRandomValues: (arr) => cryptoJest.randomBytes(arr.length)
	}
});
```
