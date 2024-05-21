module.exports = {
	extends: [
		"eslint-config-canvas",
		"plugin:cypress/recommended"
	],
	parserOptions: {
		"sourceType": "module"
	},
	rules: {
		"no-unused-expressions": "off",
		"cypress/no-unnecessary-waiting": "off"
	}
};
