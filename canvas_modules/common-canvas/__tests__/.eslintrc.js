module.exports = {
	extends: [
		"@dap/eslint-config-portal-common",
		"@dap/eslint-config-portal-common/react"
	].map(require.resolve),
	env: {

	},
	rules: {
		// Disable strict warning on ES6 Components
		"strict": 0,
		"global-require": 0,
		"sort-imports": 0,
		"react/jsx-indent-props": [2, "tab"],
		"max-len": [2, 180, 4],
		"no-unused-expressions": 0,
		"no-shadow": ["error", { "hoist": "functions" }]
	}
};
