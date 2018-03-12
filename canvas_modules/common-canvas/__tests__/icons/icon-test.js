/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { shallow } from "enzyme";
import Icon from "../../src/icons/icon.jsx";
import { expect } from "chai";


describe("Icon renders correctly", () => {

	it("should render a div when type unknown", () => {
		const icon = shallow(
			<Icon type="unknown" />);
		expect(icon.find("div")).to.have.length(1);
	});
	it("should render a svg when type known", () => {
		const icon = shallow(
			<Icon type="info" />);
		expect(icon.find(".canvas-icon")).to.have.length(1);
		expect(icon.find("svg")).to.have.length(1);
	});
});
