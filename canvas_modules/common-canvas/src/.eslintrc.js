module.exports = {
	extends: [
		"@dap/eslint-config-portal-common",
		"@dap/eslint-config-portal-common/react"
	].map(require.resolve),
    "env": {
    },
    rules: {
        // Disable strict warning on ES6 Components
        "strict": 0,
    	"global-require": 0,
        "sort-imports": 0,
    	"react/jsx-indent-props": [2, "tab"]
    },
    "globals": {
            "document": true,
            "window": true
    }
};
