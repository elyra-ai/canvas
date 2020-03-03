/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import * as testUtils from "../../utils/eventlog-utils";

describe("Test of canvas comments", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Test adding a comment", function() {
		cy.get("#createAutoComment-action").click();
		cy.document().then((doc) => {
			const lastEventLog = testUtils.getLastEventLogData(doc);
			expect("createAutoComment").to.equal(lastEventLog.data.editType);
			expect("toolbar").to.equal(lastEventLog.data.editSource);
			expect(30).to.equal(lastEventLog.data.mousePos.x);
			expect(30).to.equal(lastEventLog.data.mousePos.y);
		});
	});
});
