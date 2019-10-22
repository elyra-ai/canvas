module.exports = {
	extends: "eslint-config-canvas",
	rules: {
		// Allow snake_case, but only for object properties e.g. myObj.param_name
		"camelcase": [
			"error",
			{ "properties": "never" }
		],
		"max-len": [2, 180, 4],
		"id-length": ["error", { "min": 1 }]
	},
	env: {
		jest: true
	},
	parserOptions: {
		"sourceType": "module"
	}
};
