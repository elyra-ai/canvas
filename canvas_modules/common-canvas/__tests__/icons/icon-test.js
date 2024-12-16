/*
 * Copyright 2017-2025 Elyra Authors
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
import { render } from "@testing-library/react";
import Icon from "../../src/icons/icon.jsx";
import { expect } from "chai";


describe("Icon renders correctly", () => {

	it("should render a div when type unknown", () => {
		const icon = render(<Icon type="unknown" />);
		// divs have generic roles, thus when icon is set to unknown, there is supposed to be 2 elements with generic roles
		expect(icon.getAllByRole("generic")).to.have.length(2);
	});

	it("should render a svg when type known", () => {
		const { container } = render(<Icon type="double" />);
		expect(container.getElementsByClassName("canvas-icon")).to.have.length(1);
	});

	it("should render a svg with class name", () => {
		const { container } = render(<Icon type="integer" className="svg-test-class" />);
		expect(container.getElementsByClassName("svg-test-class")).to.have.length(1);
	});

	it("should render a svg with class 'properties-icon'", () => {
		const { container } = render(<Icon type="measurement-empty" />);
		expect(container.getElementsByClassName("properties-icon")).to.have.length(1);
	});
});
