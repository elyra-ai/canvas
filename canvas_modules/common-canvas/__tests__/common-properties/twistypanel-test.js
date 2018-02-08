/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import propertyUtils from "../_utils_/property-utils";
import twistypanelParamDef from "../test_resources/paramDefs/twistyPanel_paramDef.json";
import isEqual from "lodash/isEqual";

import { expect } from "chai";

describe("twisty panel renders correctly", () => {
	var wrapper;
	// var renderedController;
	beforeEach(() => {
		const renderedObject = propertyUtils.flyoutEditorForm(twistypanelParamDef);
		wrapper = renderedObject.wrapper;
		// renderedController = renderedObject.controller;
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("should have displayed the twisty panel with the initial control hidden", () => {
		const twisties = wrapper.find(".twisty-control-panel");
		expect(twisties).to.have.length(2);
		const twistyPanelIcon = twisties.at(0).find(".twistypanel_icon");
		expect(twistyPanelIcon).to.have.length(1);
		const hiddenTwistyContent = twisties.at(0).find(".twistypanel-panel");
		expect(hiddenTwistyContent).to.have.length(1);
		const twistyStyle = hiddenTwistyContent.at(0).prop("style");
		expect(isEqual(JSON.parse(JSON.stringify(twistyStyle)),
			JSON.parse(JSON.stringify({ height: "0px" })))).to.be.true;


	});

	it("should expand content when twisty panel link clicked", () => {
		// The way twisty panel expands content is to dynamically set the height of the twisty content to the rendered
		// clientHeight of the content wrapper child component.  The clientHeight is zero when enzyme renders it.
		// therefore the content element style height attribute is not changed.
		// TODO figure out why enzyme doesn't set client height.
		const twisties = wrapper.find(".twisty-control-panel");
		expect(twisties).to.have.length(2);
		const twistyPanelIcon = twisties.at(0).find(".twistypanel_icon");
		expect(twistyPanelIcon).to.have.length(1);
		twistyPanelIcon.at(0).simulate("click");
		wrapper.update();
		const hiddenTwistyContent = twisties.at(0).find(".twistypanel-panel");
		expect(hiddenTwistyContent).to.have.length(1);
		const twistyStyle = hiddenTwistyContent.at(0).prop("style");
		// TODO the height should have a value
		expect(isEqual(JSON.parse(JSON.stringify(twistyStyle)),
			JSON.parse(JSON.stringify({ height: "0px" })))).to.be.true;
	});
});
