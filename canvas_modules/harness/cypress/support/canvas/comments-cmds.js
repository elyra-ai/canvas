/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

Cypress.Commands.add("getCommentWithText", (commentText) => {
	cy.get("#common-canvas-items-container-0").find(".d3-comment-group")
		.then((comments) => {
			let commentId;
			let commentSelector;
			for (let idx = 0; idx < comments.length; idx++) {
				if (comments[idx].textContent === commentText) {
					commentId = comments[idx].getAttribute("data-id");
					commentSelector = "[data-id='" + commentId + "']";
					break;
				}
			}
			cy.get(commentSelector);
		});
});

Cypress.Commands.add("ctrlOrCmdClickComment", (commentText) => {
	// Get the os name to decide whether to click ctrl or cmd
	const keySelector = Cypress.platform === "darwin" ? "{meta}" : "{ctrl}";
	cy.getCommentWithText(commentText).type(keySelector, { release: false });
});
