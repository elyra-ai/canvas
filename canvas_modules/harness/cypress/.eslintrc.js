module.exports = {
	extends: [
		"eslint-config-canvas",
		"plugin:cypress/recommended",
		"eslint-config-canvas/react"
	],
	parserOptions: {
		"sourceType": "module"
	},
	rules: {
		"no-unused-expressions": "off",
		"cypress/no-unnecessary-waiting": "off"
	}
};
