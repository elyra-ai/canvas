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

import { expect } from "chai";
import { validateInput } from "./../../../src/common-properties/ui-conditions/ui-conditions.js";
import propertyUtils from "./../../_utils_/property-utils";
import structureeditorParamDef from "../../test_resources/paramDefs/structureeditor_paramDef.json";

describe("validateInput returns the correct boolean for the given condition", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(structureeditorParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
		controller.setErrorMessages({});
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("validateInput returns correct boolean when non-complex-type parameter condition is initated from a complex-type", () => {
		const optionsPropertyId = { "name": "options" };
		const optionThreePropertyId = { name: "option_three", col: 0 };

		// "option_one" and "option_two" will become visible when "options" === "options" and "option_three[0]" isEmpty
		const visibleCondition = structureeditorParamDef.conditions[6];

		const actualInitial = validateInput(visibleCondition, optionThreePropertyId, controller);
		expect(actualInitial).to.eql(false);

		controller.updatePropertyValue(optionsPropertyId, "options");
		const actualOptionsSet = validateInput(visibleCondition, optionThreePropertyId, controller);
		expect(actualOptionsSet).to.eql(true);

		controller.updatePropertyValue(optionThreePropertyId, "some text");
		const actualOptionsThreeSet = validateInput(visibleCondition, optionThreePropertyId, controller);
		expect(actualOptionsThreeSet).to.eql(false);

		controller.updatePropertyValue(optionThreePropertyId, "");
		const actualOptionsThreeUnset = validateInput(visibleCondition, optionThreePropertyId, controller);
		expect(actualOptionsThreeUnset).to.eql(true);
	});
});
