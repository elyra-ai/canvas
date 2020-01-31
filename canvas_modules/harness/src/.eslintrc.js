module.exports = {
	extends: [
		"eslint-config-canvas",
		"eslint-config-canvas/react"
	].map(require.resolve),
		"env": {
		},
		rules: {
				// Disable strict warning on ES6 Components
			"strict": 0,
			"global-require": 0,
			"sort-imports": 0,
			"react/jsx-indent-props": [2, "tab"],
			"max-len": [2, 180, 4],
		},
		"globals": {
				"document": true,
				"window": true,
				"location": true,
				"navigator": true
		}
};
