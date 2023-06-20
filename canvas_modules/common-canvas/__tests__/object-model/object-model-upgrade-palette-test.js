/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint no-console: "off" */

import deepFreeze from "deep-freeze";
import { expect } from "chai";
import isEqual from "lodash/isEqual";
import ObjectModel from "../../src/object-model/object-model.js";

import commonPalette from "../../../harness/test_resources/palettes/commonPalette.json";
import modelerPalette from "../../../harness/test_resources/palettes/modelerPalette.json";
import sparkPalette from "../../../harness/test_resources/palettes/sparkPalette.json";
import bindingWithOutputPalette from "../../../harness/test_resources/palettes/bindingWithOutputPalette.json";

import commonPaletteV2 from "../../../harness/test_resources/palettes/v2-commonPalette.json";
import modelerPaletteV2 from "../../../harness/test_resources/palettes/v2-modelerPalette.json";
import sparkPaletteV2 from "../../../harness/test_resources/palettes/v2-sparkPalette.json";

import modelerPaletteV1 from "../../../harness/test_resources/palettes/v1-modelerPalette.json";
import sparkPaletteV1 from "../../../harness/test_resources/palettes/v1-sparkPalette.json";

import modelerPaletteV0 from "../../../harness/test_resources/palettes/x-modelerPalette.json";
import sparkPaletteV0 from "../../../harness/test_resources/palettes/x-sparkPalette.json";

import { extractPaletteVersion } from "../../src/object-model/schemas-utils/upgrade-palette.js";

const objectModel = new ObjectModel();
objectModel.setSchemaValidation(true); // Ensure we validate against the schemas as we upgrade

describe("Upgrade palette test", () => {

	// --------------------------------------------------------------------------
	// These test that a latest version palette can be read in and written out the same.
	// --------------------------------------------------------------------------

	it("should read in and write out the same file: commonPalette", () => {
		readWriteSameFile(commonPalette);
	});

	it("should read in and write out the same file: modelerPalette", () => {
		readWriteSameFile(modelerPalette);
	});

	it("should read in and write out the same file: sparkPalette", () => {
		readWriteSameFile(sparkPalette);
	});

	it("should read in and write out the same file: bindingWithOutputPalette", () => {
		readWriteSameFile(bindingWithOutputPalette);
	});


	// // --------------------------------------------------------------------------
	// // These test upgrade from v2 to the latest version
	// // --------------------------------------------------------------------------
	it("should upgrade a palette from v2 to latest version for commonPaletteV2", () => {
		upgradeToLatestVersion(commonPaletteV2, commonPalette);
	});

	it("should upgrade a palette from v2 to latest version for modelerPaletteV2", () => {
		upgradeToLatestVersion(modelerPaletteV2, modelerPalette);
	});

	it("should upgrade a palette from v2 to latest version for sparkPaletteV2", () => {
		upgradeToLatestVersion(sparkPaletteV2, sparkPalette);
	});

	// // --------------------------------------------------------------------------
	// // These test upgrade from v1 to the latest version
	// // --------------------------------------------------------------------------
	it("should upgrade a palette from v1 to latest version for modelerPaletteV1", () => {
		upgradeToLatestVersion(modelerPaletteV1, modelerPalette);
	});

	it("should upgrade a palette from v1 to latest version for sparkPaletteV1", () => {
		upgradeToLatestVersion(sparkPaletteV1, sparkPalette);
	});

	// --------------------------------------------------------------------------
	// // These test upgrade from v0 to the latest version
	// // --------------------------------------------------------------------------
	it("should upgrade a palette from v0 to latest version for modelerPaletteV0", () => {
		upgradeV0ToLatestVersion(modelerPaletteV0, modelerPalette);
	});

	it("should upgrade a palette from v0 to latest version for sparkPaletteV0", () => {
		upgradeV0ToLatestVersion(sparkPaletteV0, sparkPalette);
	});


	function readWriteSameFile(file) {
		deepFreeze(file);

		objectModel.setPipelineFlowPalette(file);

		const expectedPalette = file;
		const actualPalette = objectModel.getPaletteData();

		// console.info("Expected Palette = " + JSON.stringify(expectedPalette, null, 2));
		// console.info("Actual Palette   = " + JSON.stringify(actualPalette, null, 2));

		expect(isEqual(JSON.stringify(expectedPalette, null, 4), JSON.stringify(actualPalette, null, 4))).to.be.true;
	}

	function upgradeToLatestVersion(earlierPalette, latestPalette) {
		deepFreeze(earlierPalette);

		objectModel.setPipelineFlowPalette(earlierPalette);

		let expectedPalette = latestPalette;
		const actualPalette = objectModel.getPaletteData();

		// The open_with_tool attribute for supernodes was introduced in v2 palette examples.
		// Therefore, remove any node with a open_with_tool from the expected palete JSON.
		if (extractPaletteVersion(earlierPalette) === 1) {
			expectedPalette = JSON.parse(JSON.stringify(expectedPalette));
			expectedPalette.categories = expectedPalette.categories.map((cat) => {
				cat.node_types = cat.node_types.filter((nt) => !(nt.open_with_tool && nt.open_with_tool === "shaper"));
				return cat;
			});
		}

		// The category description field was added in v2 so if we are doing an
		// upgrade from v1 we cannot expect category descriotions to be present.
		if (extractPaletteVersion(earlierPalette) === 1) {
			expectedPalette = JSON.parse(JSON.stringify(expectedPalette));
			expectedPalette.categories = expectedPalette.categories.map((cat) => {
				delete cat.description;
				return cat;
			});
		}

		// console.info("Expected Palette = " + JSON.stringify(expectedPalette, null, 2));
		// console.info("Actual Palette   = " + JSON.stringify(actualPalette, null, 2));

		expect(isEqual(JSON.stringify(expectedPalette, null, 4), JSON.stringify(actualPalette, null, 4))).to.be.true;
	}

	// V0 needs a special function because theye are specified to object model
	// using the deprecated 'setPaletteData' method.
	function upgradeV0ToLatestVersion(earlierPalette, latestPalette) {
		deepFreeze(earlierPalette);

		objectModel.setPaletteData(earlierPalette);

		// Clone expected canvas because earlier tests may have deep frozen it.
		const expectedPalette = JSON.parse(JSON.stringify(latestPalette));
		const actualPalette = objectModel.getPaletteData();

		// The open_with_tool attribute for supernodes was introduced in v2 palette examples.
		// Therefore, remove any node with a open_with_tool from the expected palete JSON.
		expectedPalette.categories = expectedPalette.categories.map((cat) => {
			cat.node_types = cat.node_types.filter((nt) => !(nt.open_with_tool && nt.open_with_tool === "shaper"));
			return cat;
		});

		// console.info("Expected Palette = " + JSON.stringify(expectedPalette, null, 2));
		// console.info("Actual Palette   = " + JSON.stringify(actualPalette, null, 2));

		expect(isEqual(JSON.stringify(expectedPalette, null, 4), JSON.stringify(actualPalette, null, 4))).to.be.true;
	}

});
