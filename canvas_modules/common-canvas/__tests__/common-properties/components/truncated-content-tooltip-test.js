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

import React from "react";
import TruncatedContentTooltip from "../../../src/common-properties/components/truncated-content-tooltip";
import { render } from "../../_utils_/mount-utils.js";
import { expect as expectJest } from "@jest/globals";


const mockTruncatedContentTooltip = jest.fn();
jest.mock("../../../src/common-properties/components/truncated-content-tooltip",
	() => (props) => mockTruncatedContentTooltip(props)
);

mockTruncatedContentTooltip.mockImplementation((props) => {
	const TruncatedContentTooltipComp = jest.requireActual(
		"../../../src/common-properties/components/truncated-content-tooltip",
	).default;
	return <TruncatedContentTooltipComp {...props} />;
});

describe("truncated-content-tooltip renders correctly", () => {
	it("props should have been defined", () => {
		render(
			<TruncatedContentTooltip
				content={<span>test</span>}
				tooltipText="tip"
				disabled
			/>
		);
		expectJest(mockTruncatedContentTooltip).toHaveBeenCalledWith({
			"content": <span>test</span>,
			"tooltipText": "tip",
			"disabled": true
		});
	});

	it("truncated-content-tooltip should render when no content specified", () => {
		render(
			<TruncatedContentTooltip
				tooltipText="tip"
			/>
		);
		expectJest(mockTruncatedContentTooltip).toHaveBeenCalledWith({
			"tooltipText": "tip"
		});
	});

});
