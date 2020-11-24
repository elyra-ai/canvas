/*
 * Copyright 2017-2020 Elyra Authors
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
import { mount, shallow } from "enzyme";
import Icon from "../../src/icons/icon.jsx";
import { expect } from "chai";


describe("Icon renders correctly", () => {

	it("should render a div when type unknown", () => {
		const icon = shallow(<Icon type="unknown" />);
		expect(icon.find("div")).to.have.length(1);
	});
	it("should render a svg when type known", () => {
		const icon = mount(<Icon type="stop" />);

		// should not have "canvas-icon" class if icon is in carbon library
		expect(icon.find("svg.canvas-icon")).to.have.length(0);
		expect(icon.find("svg")).to.have.length(1);
	});
	it("should render a svg with class name", () => {
		const icon = mount(<Icon type="stop" className="svg-test-class" />);
		expect(icon.find("svg.svg-test-class")).to.have.length(1);
	});
	it("should render a svg with class 'canvas-icon' if not in carbon", () => {
		const icon = mount(<Icon type="toggleNotificationPanel" className="svg-test-class" />);
		expect(icon.find("svg.canvas-icon")).to.have.length(1);
	});
});
