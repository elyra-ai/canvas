/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// Globals -------------------------------------------------------------------->

// The lowest version accepted
const FIRST_PALETTE_VERSION = 1;

// The latest palette version - update as new versions are developed
const LATEST_PALETTE_VERSION = 2;

// Array of major version upgrade functions
const updateFuncs = [
	_update0to1,
	_update1to2
];

// Private Methods ------------------------------------------------------------>

/**
 * Extracts the version from the given palette.
 *
 * @param {Object} palette: A palette JSON object
 *
 * @return {integer} An integer version number
 *
 * @throws {Error} If the version number cannot be extracted
 */
function _extractPaletteVersion(palette) {
	let baseVersion;
	// Validate the incoming palette
	if (!palette) {
		throw new Error("Invalid palette document");

	// Neither version 1 did not have a version number
	} else if (!palette.version) {
		baseVersion = 1;

	} else if (!(typeof palette.version === "string") ||
							palette.version.length === 0) {
		throw new Error("Invalid palette document: The 'version' attribute is missing or invalid");
	} else {
		baseVersion = parseInt(palette.version, 10);
		if (!baseVersion) {
			throw new Error("Invalid palette document: The 'version' attribute cannot be parsed");
		}
	}
	return baseVersion;
}

// Version 1 methods ------------------------>

/**
 * Updates version 0 to version 1. This is done by
 * CanvasInHandler.convertPaletteToPipelineFlowPalette() so there is
 * nothing to do here. This method should never be called so it is only
 * here for consistency with upgrade-flow.js.
 *
 * @param {object} palette: A palette JSON object
 *
 * @return A palette object that has been upgraded to version 1
 */
function _update0to1(palette) {
	return palette;
}

// Version 2 methods ------------------------>

/**
 * Updates version 1 to version 2.
 *
 * @param {object} palette: A palette JSON object
 *
 * @return A palette object that has been upgraded to version 2
 */
function _update1to2(palette) {
	palette.version = "2.0";

	return palette;
}


// Public Methods ------------------------------------------------------------->

/**
 * Upgrades the given palette object to the current version.
 *
 * @param {Object} palette: A palette JSON object
 *
 * @returns A palette object that has been upgraded to the latest version
 */
function upgradePalette(palette) {
	const baseVersion = Math.max(_extractPaletteVersion(palette), FIRST_PALETTE_VERSION);
	let pal = JSON.parse(JSON.stringify(palette));
	for (let idx = baseVersion; idx < LATEST_PALETTE_VERSION; idx++) {
		pal = updateFuncs[idx](pal);
	}
	return pal;
}


module.exports = {
	upgradePalette: upgradePalette,
	extractPaletteVersion: _extractPaletteVersion,
	LATEST_PALETTE_VERSION: LATEST_PALETTE_VERSION
};
