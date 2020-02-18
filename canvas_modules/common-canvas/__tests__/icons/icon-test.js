/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
		const icon = mount(<Icon type="notificationCounterIcon" className="svg-test-class" />);
		expect(icon.find("svg.canvas-icon")).to.have.length(1);
	});
});
