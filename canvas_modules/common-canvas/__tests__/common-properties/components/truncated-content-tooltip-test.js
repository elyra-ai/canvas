/*
 * Copyright 2017-2022 Elyra Authors
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

import React from "react";
import TruncatedContentTooltip from "../../../src/common-properties/components/truncated-content-tooltip";
import { mount } from "enzyme";
import { expect } from "chai";


describe("truncated-content-tooltip renders correctly", () => {
	it("props should have been defined", () => {
		const wrapper = mount(
			<TruncatedContentTooltip
				content={<span>test</span>}
				tooltipText="tip"
				disabled
			/>
		);
		expect(wrapper.prop("tooltipText")).to.equal("tip");
		expect(wrapper.prop("content")).to.exist;
		expect(wrapper.prop("disabled")).to.equal(true);
	});

	it("truncated-content-tooltip should render when no content specified", () => {
		const wrapper = mount(
			<TruncatedContentTooltip
				tooltipText="tip"
			/>
		);
		expect(wrapper.prop("tooltipText")).to.equal("tip");
	});

});
