# Trouble shooting


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


## Elyra Canvas styling guidelines
- Used the `data-id` attribute on inputs to be used for automated tests.  Format for common properties should be `properties-`
- **className** format format for common-properties should be `properties-`
- Limit the use of html(DOM) ids
- Minimum inline styling.  This allows for consumers to easily override styling.
- scss/sass styling should be added to the component's folder
- No `important!` in styling
- Use variables for all colors(preferably from carbon)
