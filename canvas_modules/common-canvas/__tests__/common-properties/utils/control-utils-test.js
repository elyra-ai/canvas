/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import ControlUtils from "./../../../src/common-properties/util/control-utils.js";

const propertyId = {
	name: "test"
};
const rowPropertyId = {
	name: "test",
	row: 1
};
const cellPropertyId = {
	name: "test",
	row: 1,
	col: 10
};

describe("control util tests", () => {
	it("test control id generation", () => {
		let id1 = ControlUtils.getControlId(propertyId);
		let id2 = ControlUtils.getControlId(propertyId);
		expect(id1).to.not.equal(id2);
		id1 = ControlUtils.getControlId(rowPropertyId);
		id2 = ControlUtils.getControlId(rowPropertyId);
		expect(id1).to.not.equal(id2);
		id1 = ControlUtils.getControlId(cellPropertyId);
		id2 = ControlUtils.getControlId(cellPropertyId);
		expect(id1).to.not.equal(id2);
		id1 = ControlUtils.getControlId(propertyId, "myId");
		expect(id1).to.equal(`properties-${propertyId.name}-myId`);
	});
});
