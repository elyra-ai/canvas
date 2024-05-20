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
/* eslint max-len: "off" */

Cypress.Commands.add("getCommentWithText", (commentText) =>
	cy.get(getCommentGrpSelector())
		.then((grpArray) => findGrpForText(grpArray, commentText)));

Cypress.Commands.add("getCommentWithTextInSubFlow", (commentText) =>
	cy.get(getCommentGrpSelectorInSubFlow())
		.then((grpArray) => findGrpForText(grpArray, commentText)));

Cypress.Commands.add("getCommentWithTextInSubFlowNested", (commentText) =>
	cy.get(getCommentGrpSelectorInSubFlowNested())
		.then((grpArray) => findGrpForText(grpArray, commentText)));

Cypress.Commands.add("getCommentWithTextInSupernode", (commentText, supernodeName) => {
	cy.getNodeWithLabel(supernodeName)
		.then((supernode) => {
			const supernodeId = supernode[0].getAttribute("data-id").substring(11);
			cy.get(getCommentGrpSelectorInSupernode(supernodeId))
				.then((grpArray) => findGrpForText(grpArray, commentText));
		});
});

Cypress.Commands.add("checkCommentDoesntExist", (commentText) => {
	cy.get(".d3-comments-group")
		.contains(commentText)
		.should("not.exist");
});

function getCommentGrpSelector() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > g[data-id^=comment_grp_${inst}]`;
	return selector;
}

function getCommentGrpSelectorInSubFlow() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > g > svg > g > g > g[data-id^=comment_grp_${inst}]`;
	return selector;
}

function getCommentGrpSelectorInSubFlowNested() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > g > svg > g > g > g > svg > g > g > g[data-id^=comment_grp_${inst}]`;
	return selector;
}

function getCommentGrpSelectorInSupernode(supernodeId) {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector =
	`div > svg > g > g > g[data-id='node_grp_${inst}_${supernodeId}'] > svg > g > g > g[data-id^='comment_grp_${inst}']`;
	return selector;
}

function findGrpForText(grpArray, commentText) {
	for (let idx = 0; idx < grpArray.length; idx++) {
		if (grpArray[idx].__data__.content === commentText) {
			return grpArray[idx];
		}
	}
	return null;
}

Cypress.Commands.add("ctrlOrCmdClickComment", (commentText) => {
	// Get the os name to decide whether to click ctrl or cmd
	cy.useCtrlOrCmdKey()
		.then((selectedKey) => {
			cy.get("body")
				.type(selectedKey, { release: false })
				.getCommentWithText(commentText)
				.click();
			// Cancel the command/ctrl key press -- the documentation doesn't say
			// this needs to be done but if it isn't the command key stays pressed down
			// causing problems with subsequent selections.
			cy.get("body")
				.type(selectedKey, { release: true });
		});
});

Cypress.Commands.add("ctrlOrCmdClickCommentInSupernode", (commentText, supernodeName) => {
	// Get the os name to decide whether to click ctrl or cmd
	cy.useCtrlOrCmdKey()
		.then((selectedKey) => {
			cy.get("body")
				.type(selectedKey, { release: false })
				.getCommentWithTextInSupernode(commentText, supernodeName)
				.click();

			// Cancel the command/ctrl key press
			cy.get("body")
				.type(selectedKey, { release: true });
		});
});

Cypress.Commands.add("getNumberOfSelectedComments", () => {
	cy.getSelectedComments()
		.then((selectedComments) => selectedComments.length);
});

Cypress.Commands.add("getSelectedComments", () => {
	cy.document().then((doc) => {
		const selectedComments = doc.canvasController.getSelectedComments();
		return selectedComments;
	});
});

Cypress.Commands.add("isCommentSelected", (commentText) => {
	cy.getSelectedComments()
		.then((selectedComments) => {
			const idx = selectedComments.findIndex((selComment) => selComment.content === commentText);
			if (idx > -1) {
				return true;
			}
			return false;
		});
});

Cypress.Commands.add("editTextInComment", (originalCommentText, newCommentText, saveComment = true) => {
	cy.getCommentWithText(originalCommentText)
		.dblclick({force: true})
		.get("textarea")
		.clear()
		.type(newCommentText);

	// Click somewhere on canvas to save comment
	if (saveComment) {
		cy.get(`#canvas-div-${document.instanceId}`).click(2, 2);
	}
});

Cypress.Commands.add("editTextInCommentInSubFlow", (originalCommentText, newCommentText) => {
	cy.getCommentWithTextInSubFlow(originalCommentText)
		.dblclick()
		.get("textarea")
		.clear()
		.type(newCommentText);

	// Click somewhere on canvas to save comment
	cy.get(`#canvas-div-${document.instanceId}`).click();
});

Cypress.Commands.add("editTextInCommentInSubFlowNested", (originalCommentText, newCommentText) => {
	cy.getCommentWithTextInSubFlowNested(originalCommentText)
		.dblclick()
		.get("textarea")
		.clear()
		.type(newCommentText);

	// Click somewhere on canvas to save comment
	cy.get("#canvas-div-0").click();
});

Cypress.Commands.add("editTextInCommentInSupernode", (originalCommentText, newCommentText, supernodeName) => {
	cy.getCommentWithTextInSupernode(originalCommentText, supernodeName)
		.dblclick()
		.get("textarea")
		.clear()
		.type(newCommentText);

	// Click somewhere on canvas to save comment
	cy.get("#canvas-div-0").click();
});

Cypress.Commands.add("addCommentToPosition", (commentText, canvasX, canvasY) => {
	cy.rightClickToDisplayContextMenu(canvasX, canvasY);
	cy.clickOptionFromContextMenu("New comment");
	cy.editTextInComment("", commentText);
});

Cypress.Commands.add("moveCommentToPosition", (commentText, canvasX, canvasY) => {
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const srcSelector = "[data-id='" + comment[0].getAttribute("data-id") + "'] > foreignobject > div";
			cy.getCanvasTranslateCoords()
				.then((transform) => {
					cy.window().then((win) => {
						cy.get(srcSelector)
							.trigger("mousedown", "topLeft", { which: 1, view: win });
						cy.get("#canvas-div-0")
							.trigger("mousemove", canvasX + transform.x, canvasY + transform.y, { view: win })
							.trigger("mouseup", { which: 1, view: win });
					});
				});
		});
});

Cypress.Commands.add("linkCommentToNode", (commentText, nodeLabel) => {
	// Click the comment at topLeft corner to display the guide
	// srcSelector is the selector of guide
	cy.getCommentWithText(commentText).then((comment) => {
		const sel = "[data-id='" + comment[0].getAttribute("data-id") + "'] > foreignobject > div";
		cy.get(sel).click();

		cy.document().then((doc) => {
			const srcSelector = "[data-id='" + comment[0].getAttribute("data-id") + "'] > .d3-comment-port-circle";
			cy.getNodeDimensions(nodeLabel).then((nodeDimensions) => {
				// Target canvas position within the center of the target node
				const canvasX = nodeDimensions.x_pos + (nodeDimensions.width / 2);
				const canvasY = nodeDimensions.y_pos + (nodeDimensions.height / 2);

				// Use 5 px in x and y direction to move mouse position over the port
				cy.dragAndDrop(srcSelector, 5, 5, ".svg-area", canvasX, canvasY);
			});
		});
	});
});

Cypress.Commands.add("dragAndDrop", (srcSelector, srcXPos, srcYPos, trgSelector, trgXPos, trgYPos) => {
	cy.window().then((win) => {
		cy.get(srcSelector)
			.trigger("mousedown", srcXPos, srcYPos, { which: 1, view: win });
		cy.get(trgSelector)
			.trigger("mousemove", trgXPos, trgYPos, { view: win })
			.trigger("mouseup", trgXPos, trgYPos, { which: 1, view: win });
	});
});

Cypress.Commands.add("resizeComment", (commentText, corner, newWidth, newHeight) => {
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const srcBodySelector = "[data-id='" + comment[0].getAttribute("data-id") + "'] > .d3-comment-rect";
			const srcSizingSelector = "[data-id='" + comment[0].getAttribute("data-id") + "'] > .d3-comment-sizing";

			cy.resizeObjectToDimensions(srcBodySelector, srcSizingSelector, corner, newWidth, newHeight);
		});
});

Cypress.Commands.add("resizeCommentOneDirection", (commentText, corner, newValue) => {
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const srcBodySelector = "[data-id='" + comment[0].getAttribute("data-id") + "'] > .d3-comment-rect";
			const srcSizingSelector = "[data-id='" + comment[0].getAttribute("data-id") + "'] > .d3-comment-sizing";

			cy.getObjectDimensions(srcBodySelector).then((commentDimensions) => {
				let newWidth = 0;
				let newHeight = 0;
				let newCorner = "";

				if (corner === "north") {
					newWidth = commentDimensions.width;
					newHeight = newValue;
					newCorner = "north-east";

				} else if (corner === "east") {
					newWidth = newValue;
					newHeight = commentDimensions.height;
					newCorner = "south-east";

				} else if (corner === "west") {
					newWidth = newValue;
					newHeight = commentDimensions.height;
					newCorner = "south-west";

				} else { // "south"
					newWidth = commentDimensions.width;
					newHeight = newValue;
					newCorner = "south-west";
				}

				cy.resizeObjectToDimensions(srcBodySelector, srcSizingSelector, newCorner, newWidth, newHeight);
			});
		});
});

Cypress.Commands.add("deleteCommentUsingContextMenu", (commentText) => {
	// Delete comment using context menu
	cy.getCommentWithText(commentText)
		.rightclick();
	cy.clickOptionFromContextMenu("Delete");
});

Cypress.Commands.add("deleteCommentUsingKeyboard", (commentText) => {
	// Delete comment by pressing 'Delete' key on keyboard
	cy.useDeleteKey()
		.then((deleteKey) => {
			cy.getCommentWithText(commentText)
				.click()
				.type(deleteKey);
		});
});

Cypress.Commands.add("deleteCommentUsingToolbar", (commentText) => {
	// Select comment and press delete icon on toolbar
	cy.getCommentWithText(commentText).click();
	cy.clickToolbarDelete();
});

Cypress.Commands.add("selectAllCommentsUsingCtrlOrCmdKey", () => {
	cy.get("#canvas-div-0").find(".d3-comment-group")
		.then((comments) => {
			cy.useCtrlOrCmdKey()
				.then((selectedKey) => {
					// Press and hold the ctrl/cmd key
					cy.get("body")
						.type(selectedKey, { release: false });

					// Click all the comments
					comments.each((idx, node) => {
						cy.wrap(node)
							.click();
					});

					// Cancel the ctrl/cmd key press
					cy.get("body")
						.type(selectedKey, { release: true });
				});
		});
});

Cypress.Commands.add("selectTextInComment", (textToSelect, commentText) => {
	cy.getCommentWithText(commentText)
		.get("textarea")
		.then((tas) => {
			const start = commentText.indexOf(textToSelect);
			const end = start + textToSelect.length;
			tas[0].setSelectionRange(start, end);
		});
});

Cypress.Commands.add("hoverOverComment", (commentText) => {
	cy.getCommentWithText(commentText)
		.trigger("mouseenter");
	cy.getCommentWithText(commentText)
		.trigger("mouseover");
});

